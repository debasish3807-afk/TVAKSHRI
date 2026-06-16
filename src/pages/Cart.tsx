import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useState, useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import { useCoupons } from "@/hooks/useCoupons";
import { formatPrice } from "@/lib/utils";
import { sanitizeCouponCode } from "@/lib/sanitize";
import { toast } from "sonner";
import type { Coupon } from "@/types";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, shippingFee, total, totalItems } = useCart();
  const { validateCoupon } = useCoupons();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const finalTotal = total - couponDiscount;

  const applyCoupon = useCallback(async () => {
    const sanitized = sanitizeCouponCode(couponCode);
    if (!sanitized) { setCouponError("Please enter a valid coupon code"); return; }
    setCouponError("");
    setCouponLoading(true);
    const result = await validateCoupon(sanitized, subtotal);
    setCouponLoading(false);
    if (result.valid && result.coupon && result.discount !== undefined) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError(result.error || "Invalid coupon code");
    }
  }, [couponCode, subtotal, validateCoupon]);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  const proceedToCheckout = () => {
    if (appliedCoupon) {
      sessionStorage.setItem("tvak_coupon", JSON.stringify({ coupon: appliedCoupon, discount: couponDiscount }));
    } else {
      sessionStorage.removeItem("tvak_coupon");
    }
    navigate("/checkout");
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center">
      <div className="text-center py-20">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="font-sans text-muted-foreground mb-6">Discover our luxurious herbal skincare rituals</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <h1 className="section-title mb-3">Your Cart</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">{totalItems} item{totalItems !== 1 ? "s" : ""} in your ritual collection</p>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-soft">
                <Link to={`/product/${product.slug}`} className="flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover"
                    style={{ background: product.bgColor }}
                    loading="lazy"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-sans text-xs text-muted-foreground">{product.category}</p>
                      <Link to={`/product/${product.slug}`} className="font-display text-base font-semibold text-foreground hover:text-gold-600 transition-colors">{product.name}</Link>
                      <p className="font-sans text-xs text-muted-foreground">{product.weight}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors p-1 flex-shrink-0"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-xl overflow-hidden" role="group" aria-label="Quantity">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-cream-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-sans text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, Math.min(product.stockCount, quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-cream-200 transition-colors"
                        aria-label="Increase quantity"
                        disabled={quantity >= product.stockCount}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base font-semibold text-gold-600">{formatPrice(product.price * quantity)}</p>
                      {quantity > 1 && <p className="font-sans text-xs text-muted-foreground">{formatPrice(product.price)} each</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-500" /> Apply Coupon
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-herbal-50 border border-herbal-200 rounded-xl">
                  <div>
                    <p className="font-sans text-sm font-semibold text-herbal-600">{appliedCoupon.code} applied!</p>
                    <p className="font-sans text-xs text-herbal-500">You save {formatPrice(couponDiscount)}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-500 text-xs font-sans font-medium hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    placeholder="Enter coupon code (try TVAK10)"
                    className="input-field flex-1 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    maxLength={20}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="btn-outline px-4 py-3 text-sm whitespace-nowrap rounded-xl disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p role="alert" className="font-sans text-xs text-rose-500 mt-2">{couponError}</p>
              )}
              <p className="font-sans text-xs text-muted-foreground mt-2">Try: TVAK10 · FIRST15 · BRIDE100 · GLOW200</p>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-24">
              <h3 className="font-display text-xl font-semibold mb-6">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-sans text-sm text-herbal-600">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-herbal-600 font-semibold">FREE</span> : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="font-sans text-xs text-muted-foreground">Add {formatPrice(999 - subtotal)} more for free shipping</p>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-display font-semibold text-foreground">Total</span>
                  <span className="font-display text-xl font-semibold text-gold-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button onClick={proceedToCheckout} className="btn-primary w-full py-4 text-base mb-3 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
              <Link to="/shop" className="btn-ghost w-full py-3 text-sm text-center flex items-center justify-center">
                Continue Shopping
              </Link>

              <div className="mt-4 p-3 bg-cream-200 rounded-xl">
                <p className="font-sans text-xs text-muted-foreground text-center">🔒 Secure checkout · Prepaid orders only</p>
                <p className="font-sans text-xs text-muted-foreground text-center mt-1">UPI · Cards · Net Banking accepted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
