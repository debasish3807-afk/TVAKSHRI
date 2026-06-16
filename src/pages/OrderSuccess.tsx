import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Package, Truck, MessageCircle, ArrowRight, Calendar, Search } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice, formatDate, getDeliveryDate } from "@/lib/utils";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") || "";
  const { getOrderById } = useOrders();
  const order = getOrderById(orderId);

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center py-16">
      <div className="container-custom max-w-2xl">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-product overflow-hidden">
          {/* Header */}
          <div className="bg-herbal-gradient p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-2">Order Confirmed!</h1>
            <p className="font-sans text-sm text-white/80">Your Ayurvedic ritual is on its way 🌿</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Order ID */}
            <div className="text-center p-4 bg-cream-100 rounded-2xl">
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
              <p className="font-display text-xl font-semibold text-gold-600">{orderId}</p>
              {order && (
                <p className="font-sans text-sm text-muted-foreground mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              )}
            </div>

            {/* Delivery timeline */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold">Delivery Timeline</h3>
              {[
                { icon: CheckCircle2, label: "Order Confirmed", sub: "Payment received", done: true },
                { icon: Package, label: "Processing", sub: "We're preparing your order", done: true },
                { icon: Truck, label: "Out for Delivery", sub: `Expected by ${getDeliveryDate(5)}`, done: false },
              ].map(({ icon: Icon, label, sub, done }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-herbal-100" : "bg-cream-200"}`}>
                    <Icon className={`w-5 h-5 ${done ? "text-herbal-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`font-sans text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
                    <p className="font-sans text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Items */}
            {order && (
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="p-4 bg-cream-100 border-b border-border">
                  <h3 className="font-display text-base font-semibold">Items Ordered</h3>
                </div>
                <div className="divide-y divide-border">
                  {order.items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3 p-4">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" style={{ background: product.bgColor }} />
                      <div className="flex-1">
                        <p className="font-sans text-sm font-medium text-foreground">{product.name}</p>
                        <p className="font-sans text-xs text-muted-foreground">Qty: {quantity} · {product.weight}</p>
                      </div>
                      <p className="font-sans text-sm font-semibold text-gold-600">{formatPrice(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-cream-50 border-t border-border">
                  <div className="flex justify-between font-display font-semibold">
                    <span>Total Paid</span>
                    <span className="text-gold-600">{formatPrice(order.finalTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Info */}
            {order && (
              <div className="p-4 bg-cream-100 rounded-2xl">
                <h3 className="font-display text-base font-semibold mb-2">Delivering to</h3>
                <p className="font-sans text-sm text-foreground">{order.customer.name}</p>
                <p className="font-sans text-sm text-muted-foreground">{order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
                <p className="font-sans text-sm text-muted-foreground">{order.customer.phone}</p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/track-order?id=${orderId}`}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Search className="w-4 h-4" /> Track This Order
              </Link>
              <Link to="/shop" className="flex-1 btn-outline flex items-center justify-center gap-2 py-3">
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="font-sans text-xs text-muted-foreground text-center">
              A confirmation email has been sent to {order?.customer?.email || "your email"}. For support, reach us at support@tvakshri.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
