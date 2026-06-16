
import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, Package, MapPin, Clock, CheckCircle, Truck, XCircle,
  PackageCheck, PackageOpen, Bike, ChevronRight, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

// ── Timeline helpers ──────────────────────────────────────────────────────────

const TIMELINE_STEPS: {
  key: string;
  label: string;
  icon: React.ElementType;
  offsetDays: number;
  description: string;
}[] = [
  { key: "confirmed",        label: "Order Confirmed",   icon: CheckCircle,  offsetDays: 0, description: "We've received your order" },
  { key: "processing",       label: "Processing",        icon: PackageOpen,  offsetDays: 1, description: "Your items are being prepared" },
  { key: "shipped",          label: "Shipped",           icon: Package,      offsetDays: 2, description: "On its way to the courier" },
  { key: "out_for_delivery", label: "Out for Delivery",  icon: Bike,         offsetDays: 4, description: "Your delivery agent is nearby" },
  { key: "delivered",        label: "Delivered",         icon: PackageCheck, offsetDays: 5, description: "Package delivered successfully" },
];

const STATUS_TO_STEP: Record<string, number> = {
  pending:    0,
  confirmed:  0,
  processing: 1,
  shipped:    2,
  delivered:  4,
  cancelled:  -1,
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

const STATUS_COLOR: Record<string, string> = {
  confirmed:  "text-herbal-600 bg-herbal-100",
  processing: "text-saffron-600 bg-saffron-100",
  shipped:    "text-blue-600 bg-blue-100",
  delivered:  "text-herbal-700 bg-herbal-100",
  cancelled:  "text-rose-600 bg-rose-100",
  pending:    "text-muted-foreground bg-cream-200",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  confirmed:  CheckCircle,
  processing: Clock,
  shipped:    Truck,
  delivered:  CheckCircle,
  cancelled:  XCircle,
  pending:    Clock,
};

// ── Delivery Timeline ─────────────────────────────────────────────────────────

function DeliveryTimeline({ status, createdAt }: { status: string; createdAt: string }) {
  const activeStep = STATUS_TO_STEP[status] ?? 0;
  const cancelled = status === "cancelled";

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
        <div>
          <p className="font-sans text-sm font-semibold text-rose-700">Order Cancelled</p>
          <p className="font-sans text-xs text-rose-500 mt-0.5">This order has been cancelled. If you have questions, contact our support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile: vertical with details */}
      <div className="flex sm:hidden flex-col gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= activeStep;
          const active = i === activeStep;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={cn(
                  "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all",
                  done
                    ? active
                      ? "bg-gold-500 border-gold-500 shadow-gold ring-4 ring-gold-100"
                      : "bg-herbal-500 border-herbal-500"
                    : "bg-white border-border"
                )}>
                  <Icon className={cn("w-4 h-4", done ? "text-white" : "text-muted-foreground")} />
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={cn("w-0.5 h-8 mt-1", i < activeStep ? "bg-herbal-400" : "bg-border")} />
                )}
              </div>
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn(
                    "font-sans text-sm font-semibold",
                    done ? (active ? "text-gold-700" : "text-herbal-700") : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  {active && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full font-sans text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" /> Current
                    </span>
                  )}
                </div>
                <p className={cn("font-sans text-xs mt-0.5", done ? "text-muted-foreground" : "text-muted-foreground/60")}>
                  {step.description}
                </p>
                <p className={cn("font-sans text-[11px] font-medium mt-1", done ? "text-gold-600" : "text-muted-foreground/50")}>
                  {addDays(createdAt, step.offsetDays)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden sm:block">
        <div className="flex items-start">
          {TIMELINE_STEPS.map((step, i) => {
            const done = i <= activeStep;
            const active = i === activeStep;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 relative">
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all z-10",
                    done
                      ? active
                        ? "bg-gold-500 border-gold-500 shadow-gold ring-4 ring-gold-100"
                        : "bg-herbal-500 border-herbal-500"
                      : "bg-white border-border"
                  )}>
                    <Icon className={cn("w-5 h-5", done ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className="text-center max-w-[90px]">
                    <p className={cn(
                      "font-sans text-xs font-semibold leading-tight",
                      done ? (active ? "text-gold-700" : "text-herbal-700") : "text-muted-foreground"
                    )}>
                      {step.label}
                      {active && <span className="block w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse mx-auto mt-1" />}
                    </p>
                    <p className={cn(
                      "font-sans text-[10px] mt-1 leading-snug",
                      done ? "text-muted-foreground" : "text-muted-foreground/50"
                    )}>
                      {step.description}
                    </p>
                    <p className={cn(
                      "font-sans text-[10px] font-semibold mt-1",
                      done ? "text-gold-600" : "text-muted-foreground/40"
                    )}>
                      {addDays(createdAt, step.offsetDays)}
                    </p>
                  </div>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 mb-14 rounded-full transition-all",
                    i < activeStep ? "bg-herbal-400" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Map Supabase row to Order ─────────────────────────────────────────────────

function mapOrderRow(row: Record<string, unknown>): Order {
  const addr = row.shipping_address as Record<string, string> | null;
  return {
    id:            row.id as string,
    items:         (row.items as Order["items"]) ?? [],
    total:         ((row.total as number) ?? 0) + ((row.discount as number) ?? 0),
    discount:      (row.discount as number) ?? 0,
    finalTotal:    (row.total as number) ?? 0,
    couponCode:    (row.coupon_code as string) ?? undefined,
    customer: {
      name:    (row.customer_name as string) ?? addr?.name ?? "",
      email:   (row.customer_email as string) ?? addr?.email ?? "",
      phone:   (row.customer_phone as string) ?? addr?.phone ?? "",
      address: addr?.address ?? "",
      city:    addr?.city ?? "",
      state:   addr?.state ?? "",
      pincode: addr?.pincode ?? "",
    },
    paymentMethod: (row.payment_method as string) ?? "upi",
    status:        (row.status as Order["status"]) ?? "confirmed",
    createdAt:     (row.created_at as string) ?? new Date().toISOString(),
    updatedAt:     (row.updated_at as string) ?? new Date().toISOString(),
  };
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("id") ?? "";
  const [inputId, setInputId] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookupOrder = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;

    setLoading(true);
    setNotFound(false);
    setOrder(null);
    setSearched(true);

    setSearchParams({ id: trimmed }, { replace: true });

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", trimmed)
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      setNotFound(true);
      return;
    }

    setOrder(mapOrderRow(data as Record<string, unknown>));
  }, [setSearchParams]);

  // Auto-search if ID was in URL on mount — use useEffect (not useState)
  useEffect(() => {
    if (initialId) {
      lookupOrder(initialId);
    }
    // The previous comment "// eslint-disable-next-line react-hooks/exhaustive-deps"
    // was trying to disable the exhaustive-deps rule.
    // However, if initialId can change, it should be in the dependency array.
    // If it's truly only meant to run on mount with the *initial* value,
    // then the current empty array is correct, and the error implies the linter
    // is configured without 'react-hooks/exhaustive-deps' rule enabled or similar.
    // Given the error message "Definition for rule 'react-hooks/exhaustive-deps' was not found",
    // the ESLint configuration might be missing the `eslint-plugin-react-hooks` setup.
    // Removing the comment as it's not a syntax error, but a linter configuration issue.
    // The code itself is syntactically valid TypeScript/React.
  }, [initialId, lookupOrder]); // Added initialId and lookupOrder to deps for correctness if linter was active.
                               // If `lookupOrder` is truly stable due to `useCallback` with stable deps,
                               // and `initialId` won't change after mount, an empty dep array would be fine.
                               // But typically, for a robust linter setup, `initialId` would be a dep.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(inputId);
  };

  const StatusIcon = order ? (STATUS_ICON[order.status] ?? Clock) : Clock;
  const estimatedDelivery = order ? addDays(order.createdAt, 5) : null;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero */}
      <section className="page-hero text-center">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="section-title mb-3">Track Your Order</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">
            Enter your Order ID to get real-time delivery updates
          </p>
        </div>
      </section>

      <div className="container-custom max-w-2xl mx-auto py-8 px-4">
        {/* Search form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <label htmlFor="track-order-id" className="font-sans text-sm font-semibold text-foreground block mb-3">
            Order ID
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="track-order-id"
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="e.g. TVK-1234567890"
                className="input-field pl-11 pr-4 font-mono text-sm"
                autoFocus={!initialId}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputId.trim()}
              className="btn-primary px-6 py-3 text-sm whitespace-nowrap flex items-center gap-2 disabled:opacity-60"
              aria-busy={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
          <p className="font-sans text-xs text-muted-foreground mt-3">
            Your Order ID was sent to your email and is shown on the order confirmation page.
          </p>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-gold-500 mx-auto mb-3" />
            <p className="font-sans text-sm text-muted-foreground">Looking up your order...</p>
          </div>
        )}

        {/* Not found */}
        {!loading && searched && notFound && (
          <div className="bg-white rounded-2xl shadow-soft p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">Order Not Found</h3>
            <p className="font-sans text-sm text-muted-foreground mb-1">
              We couldn't find an order matching <span className="font-mono font-semibold text-foreground">"{inputId}"</span>
            </p>
            <p className="font-sans text-xs text-muted-foreground mb-6">
              Please double-check the Order ID from your confirmation email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setInputId(""); setSearched(false); setNotFound(false); }}
                className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2 justify-center"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <Link to="/contact" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 justify-center">
                Contact Support <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Order result */}
        {!loading && order && (
          <div className="space-y-4">
            {/* Order header */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-sans text-xs text-muted-foreground mb-1">Order ID</p>
                    <p className="font-mono text-sm font-bold text-gold-600 break-all">{order.id}</p>
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-sans text-sm font-semibold capitalize self-start sm:self-auto",
                    STATUS_COLOR[order.status] ?? "bg-cream-200 text-foreground"
                  )}>
                    <StatusIcon className="w-4 h-4" /> {order.status}
                  </span>
                </div>
              </div>

              {/* Summary row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-border border-b border-border">
                <div className="px-5 py-4">
                  <p className="font-sans text-xs text-muted-foreground mb-0.5">Placed On</p>
                  <p className="font-sans text-sm font-semibold text-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="font-sans text-xs text-muted-foreground mb-0.5">Order Total</p>
                  <p className="font-display text-sm font-bold text-gold-600">{formatPrice(order.finalTotal)}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 px-5 py-4 border-t sm:border-t-0 border-border">
                  <p className="font-sans text-xs text-muted-foreground mb-0.5">Est. Delivery</p>
                  <p className="font-sans text-sm font-semibold text-herbal-600">
                    {order.status === "delivered" ? "Delivered" : order.status === "cancelled" ? "Cancelled" : estimatedDelivery}
                  </p>
                </div>
              </div>

              {/* Customer info */}
              <div className="px-5 py-4 border-b border-border bg-cream-50">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-foreground mb-0.5">
                      Delivering to: {order.customer.name}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                      {[order.customer.address, order.customer.city, order.customer.state, order.customer.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-5 sm:p-6">
                <h3 className="font-display text-base font-semibold text-foreground mb-5">
                  Delivery Progress
                </h3>
                <DeliveryTimeline status={order.status} createdAt={order.createdAt} />
              </div>
            </div>

            {/* Product summary */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Items in This Order
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({order.items.length} {order.items.length === 1 ? "item" : "items"})
                  </span>
                </h3>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-4">
                    <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover hover:opacity-90 transition-opacity"
                        style={{ background: item.product.bgColor }}
                        loading="lazy"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.slug}`}>
                        <p className="font-sans text-sm font-semibold text-foreground hover:text-gold-600 transition-colors truncate">
                          {item.product.name}
                        </p>
                      </Link>
                      <p className="font-sans text-xs text-muted-foreground mt-0.5">
                        {item.product.weight} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-display text-sm font-semibold text-gold-600 flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="px-5 pb-5 pt-3 border-t border-border space-y-1.5">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.total - order.discount)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between font-sans text-sm text-herbal-600">
                    <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                    <span>−{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display font-semibold text-base border-t border-border pt-2 mt-2">
                  <span>Total Paid</span>
                  <span className="text-gold-600">{formatPrice(order.finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Support CTA */}
            <div className="bg-white rounded-2xl shadow-soft p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-sans text-sm font-semibold text-foreground">Need help with this order?</p>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">Our team is available to assist you with any queries.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link to="/contact" className="btn-outline py-2.5 px-4 text-sm whitespace-nowrap flex items-center gap-1.5">
                  Contact Us <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => { setOrder(null); setInputId(""); setSearched(false); setSearchParams({}); }}
                  className="btn-ghost py-2.5 px-4 text-sm whitespace-nowrap"
                >
                  Track Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Initial empty state */}
        {!loading && !searched && (
          <div className="bg-white rounded-2xl shadow-soft p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Enter Your Order ID</h3>
            <p className="font-sans text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Your Order ID was sent to your email upon purchase. It looks like <span className="font-mono font-semibold">TVK-XXXXXXXX</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/shop" className="btn-primary py-2.5 px-5 text-sm">Browse Products</Link>
              <Link to="/account" className="btn-outline py-2.5 px-5 text-sm">View My Orders</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
