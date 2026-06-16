import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Smartphone, Building2, Lock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { useCoupons } from "@/hooks/useCoupons";
import { useLoyalty } from "@/hooks/useLoyalty";
import { formatPrice, generateOrderId, getDeliveryDate } from "@/lib/utils";
import { sanitizeText, sanitizeCouponCode, normalizeEmail } from "@/lib/sanitize";
import type { CustomerInfo, PaymentMethod } from "@/types";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid 10-digit phone required").max(10),
  address: z.string().min(10, "Full address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pincode: z.string().length(6, "Valid 6-digit pincode required"),
});

type FormData = z.infer<typeof schema>;

const INDIAN_STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala",
  "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "West Bengal", "Other"
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, shippingFee, clearCart, sessionId } = useCart();
  const { addOrder } = useOrders();
  const { validateCoupon, incrementUsage } = useCoupons();
  const { recordOrderSpend } = useLoyalty();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState<{
    applied: boolean;
    discount: number;
    description: string;
    code: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = couponState?.discount ?? 0;
  const finalTotal = subtotal + shippingFee - discount;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const sanitized = sanitizeCouponCode(couponCode.trim());
    if (!sanitized) { toast.error("Invalid coupon format"); return; }
    setCouponLoading(true);
    const result = await validateCoupon(sanitized, subtotal);
    setCouponLoading(false);
    if (result.valid && result.coupon && result.discount !== undefined) {
      setCouponState({
        applied: true,
        discount: result.discount,
        description: result.coupon.description,
        code: sanitized,
      });
      toast.success(`Coupon applied — ₹${result.discount} off!`);
    } else {
      toast.error(result.error ?? "Invalid coupon");
      setCouponState(null);
    }
  };

  const removeCoupon = () => {
    setCouponState(null);
    setCouponCode("");
  };

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) return;
    setProcessing(true);
    try {
      const order = {
        id: generateOrderId(),
        items,
        total: subtotal + shippingFee,
        discount,
        finalTotal,
        couponCode: couponState?.code,
        customer: {
          ...data,
          name: sanitizeText(data.name),
          email: normalizeEmail(data.email),
          address: sanitizeText(data.address),
          city: sanitizeText(data.city),
          state: sanitizeText(data.state),
        } as CustomerInfo,
        paymentMethod,
        paymentId: `PAY${Date.now().toString(36).toUpperCase()}`,
        status: "confirmed" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: getDeliveryDate(5),
      };

      await addOrder(order);

      // Increment coupon usage if applied
      if (couponState?.code) {
        await incrementUsage(couponState.code);
      }

      // Update loyalty lifetime spend
      await recordOrderSpend(finalTotal);

      clearCart();
      sessionStorage.removeItem("tvak_coupon");
      navigate(`/order-success?orderId=${order.id}`);
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const paymentMethods = [
    { key: "upi" as PaymentMethod, icon: Smartphone, label: "UPI", sub: "Google Pay, PhonePe, BHIM, Paytm" },
    { key: "card" as PaymentMethod, icon: CreditCard, label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
    { key: "netbanking" as PaymentMethod, icon: Building2, label: "Net Banking", sub: "All major Indian banks" },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <h1 className="section-title mb-3">Secure Checkout</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-herbal-500" /> Your payment is 100% secured with SSL encryption
          </p>
        </div>
      </section>

      <div className="container-custom py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Full Name *</label>
                    <input {...register("name")} className="input-field" placeholder="Priya Sharma" />
                    {errors.name && <p className="font-sans text-xs text-rose-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Email *</label>
                    <input {...register("email")} type="email" className="input-field" placeholder="priya@example.com" />
                    {errors.email && <p className="font-sans text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Phone *</label>
                    <input {...register("phone")} type="tel" className="input-field" placeholder="9876543210" maxLength={10} />
                    {errors.phone && <p className="font-sans text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Address *</label>
                    <textarea {...register("address")} rows={2} className="input-field resize-none" placeholder="House/Flat No., Street, Area, Landmark" />
                    {errors.address && <p className="font-sans text-xs text-rose-500 mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">City *</label>
                    <input {...register("city")} className="input-field" placeholder="Mumbai" />
                    {errors.city && <p className="font-sans text-xs text-rose-500 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Pincode *</label>
                    <input {...register("pincode")} className="input-field" placeholder="400001" maxLength={6} />
                    {errors.pincode && <p className="font-sans text-xs text-rose-500 mt-1">{errors.pincode.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">State *</label>
                    <select {...register("state")} className="input-field">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="font-sans text-xs text-rose-500 mt-1">{errors.state.message}</p>}
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold mb-4">Coupon Code</h2>
                {couponState?.applied ? (
                  <div className="flex items-center justify-between p-4 bg-herbal-50 border border-herbal-200 rounded-xl">
                    <div>
                      <p className="font-mono text-sm font-bold text-herbal-700">{couponState.code}</p>
                      <p className="font-sans text-xs text-herbal-600">{couponState.description} — saves {formatPrice(couponState.discount)}</p>
                    </div>
                    <button type="button" onClick={removeCoupon} className="font-sans text-xs text-rose-500 hover:text-rose-700 transition-colors">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code (e.g. TVAK10)"
                      className="input-field flex-1"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn-outline px-5 py-3 whitespace-nowrap disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                <p className="font-sans text-xs text-muted-foreground mt-2">Try: TVAK10 · FIRST15 · BRIDE100 · GLOW200</p>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold mb-2">Payment Method</h2>
                <p className="font-sans text-xs text-muted-foreground mb-6">⚠️ We accept prepaid payments only. No Cash on Delivery.</p>
                <div className="space-y-3 mb-6">
                  {paymentMethods.map(({ key, icon: Icon, label, sub }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === key ? "border-gold-500 bg-gold-50" : "border-border hover:border-gold-300"
                      }`}
                    >
                      <input type="radio" name="payment" value={key} checked={paymentMethod === key} onChange={() => setPaymentMethod(key)} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${paymentMethod === key ? "border-gold-500 bg-gold-500" : "border-border"}`}>
                        {paymentMethod === key && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-sans text-sm font-semibold text-foreground">{label}</p>
                        <p className="font-sans text-xs text-muted-foreground">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "upi" && (
                  <div className="p-4 bg-cream-100 rounded-xl">
                    <label className="font-sans text-sm font-medium text-foreground block mb-2">Enter UPI ID</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="input-field" />
                    <p className="font-sans text-xs text-muted-foreground mt-2">e.g. priya@okaxis, 9876543210@paytm</p>
                  </div>
                )}
                {paymentMethod === "card" && (
                  <div className="p-4 bg-cream-100 rounded-xl space-y-3">
                    <input className="input-field" placeholder="Card Number" maxLength={19} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input-field" placeholder="MM / YY" />
                      <input className="input-field" placeholder="CVV" maxLength={3} type="password" />
                    </div>
                    <input className="input-field" placeholder="Name on card" />
                  </div>
                )}
                {paymentMethod === "netbanking" && (
                  <div className="p-4 bg-cream-100 rounded-xl">
                    <select className="input-field">
                      <option value="">Select your bank</option>
                      {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "Punjab National Bank", "Bank of Baroda", "Other"].map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-24">
                <h3 className="font-display text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" style={{ background: product.bgColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs font-medium text-foreground truncate">{product.name}</p>
                        <p className="font-sans text-xs text-muted-foreground">Qty: {quantity}</p>
                      </div>
                      <p className="font-sans text-sm font-semibold text-foreground flex-shrink-0">{formatPrice(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2 mb-6">
                  <div className="flex justify-between font-sans text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-sans text-sm text-herbal-600">
                      <span>Discount ({couponState?.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-sans text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingFee === 0 ? <span className="text-herbal-600">FREE</span> : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-display font-semibold border-t border-border pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-gold-600 text-xl">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={processing || items.length === 0}
                  className="btn-primary w-full py-4 text-base disabled:opacity-70"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8" />
                      </svg>
                      Placing order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Pay {formatPrice(finalTotal)}
                    </span>
                  )}
                </button>
                <p className="font-sans text-xs text-muted-foreground text-center mt-3">🔒 100% secure · SSL encrypted</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
