import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, ShoppingBag, Heart, LogOut, Package, ChevronRight,
  MapPin, Clock, CheckCircle, Truck, XCircle, Loader2, Trash2,
  Camera, Crown, Gift, Star, TrendingUp, Sparkles, Copy,
  PackageCheck, PackageOpen, Bike, PenLine, RotateCcw
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";
import { useProfile } from "@/hooks/useProfile";
import {
  useLoyalty,
  TIER_META, TIER_BENEFITS, TIER_EXCLUSIVE_COUPONS,
  TIER_THRESHOLDS, getNextTier, getTierProgress, calculateTier,
  type LoyaltyTier
} from "@/hooks/useLoyalty";
import { LoyaltyBadge } from "@/components/features/LoyaltyBadge";
import { authService } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/types";

type Tab = "orders" | "wishlist" | "rewards" | "profile";

// ── Review types ────────────────────────────────────────────────────────────
interface ReviewFormState {
  rating: number;
  hoverRating: number;
  comment: string;
  submitting: boolean;
  submitted: boolean;
}

// ── Star Picker ──────────────────────────────────────────────────────────────
function StarPicker({
  rating,
  hoverRating,
  onRate,
  onHover,
  onLeave,
}: {
  rating: number;
  hoverRating: number;
  onRate: (r: number) => void;
  onHover: (r: number) => void;
  onLeave: () => void;
}) {
  return (
    <div className="flex items-center gap-1" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (hoverRating || rating);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onRate(s)}
            onMouseEnter={() => onHover(s)}
            className="transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "w-7 h-7 transition-colors",
                filled ? "fill-gold-400 text-gold-400" : "text-border hover:text-gold-300"
              )}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 font-sans text-sm font-semibold text-gold-600">
          {["Terrible", "Poor", "Okay", "Good", "Excellent!"][rating - 1]}
        </span>
      )}
    </div>
  );
}

// ── Delivery Timeline ────────────────────────────────────────────────────────

const TIMELINE_STEPS: {
  key: string;
  label: string;
  icon: React.ElementType;
  offsetDays: number;
}[] = [
  { key: "confirmed",        label: "Confirmed",        icon: CheckCircle,  offsetDays: 0 },
  { key: "processing",       label: "Processing",       icon: PackageOpen,  offsetDays: 1 },
  { key: "shipped",          label: "Shipped",          icon: Package,      offsetDays: 2 },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike,         offsetDays: 4 },
  { key: "delivered",        label: "Delivered",        icon: PackageCheck, offsetDays: 5 },
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
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function DeliveryTimeline({ status, createdAt }: { status: string; createdAt: string }) {
  const activeStep = STATUS_TO_STEP[status] ?? 0;
  const cancelled = status === "cancelled";

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 px-5 py-3 bg-rose-50 border-t border-rose-100">
        <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
        <span className="font-sans text-xs text-rose-600 font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 border-t border-border overflow-x-auto">
      {/* Mobile: vertical compact */}
      <div className="flex sm:hidden flex-col gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= activeStep;
          const active = i === activeStep;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  done
                    ? active
                      ? "bg-gold-500 border-gold-500 shadow-gold"
                      : "bg-herbal-500 border-herbal-500"
                    : "bg-white border-border"
                )}>
                  <Icon className={cn("w-3.5 h-3.5", done ? "text-white" : "text-muted-foreground")} />
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={cn("w-0.5 h-5 my-0.5", i < activeStep ? "bg-herbal-400" : "bg-border")} />
                )}
              </div>
              <div className="pb-3">
                <p className={cn("font-sans text-xs font-semibold leading-tight", done ? (active ? "text-gold-600" : "text-herbal-700") : "text-muted-foreground")}>
                  {step.label}
                  {active && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />}
                </p>
                <p className="font-sans text-[10px] text-muted-foreground mt-0.5">{addDays(createdAt, step.offsetDays)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start gap-0 min-w-[480px]">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= activeStep;
          const active = i === activeStep;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                  done
                    ? active
                      ? "bg-gold-500 border-gold-500 shadow-gold ring-2 ring-gold-200"
                      : "bg-herbal-500 border-herbal-500"
                    : "bg-white border-border"
                )}>
                  <Icon className={cn("w-4 h-4", done ? "text-white" : "text-muted-foreground")} />
                </div>
                <div className="text-center">
                  <p className={cn("font-sans text-[10px] font-semibold whitespace-nowrap leading-tight", done ? (active ? "text-gold-600" : "text-herbal-700") : "text-muted-foreground")}>
                    {step.label}
                    {active && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />}
                  </p>
                  <p className="font-sans text-[9px] text-muted-foreground">{addDays(createdAt, step.offsetDays)}</p>
                </div>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all",
                  i < activeStep ? "bg-herbal-400" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<string, React.ElementType> = {
  confirmed: CheckCircle,
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  pending: Clock,
};

const STATUS_COLOR: Record<string, string> = {
  confirmed: "text-herbal-600 bg-herbal-100",
  processing: "text-saffron-600 bg-saffron-100",
  shipped: "text-blue-600 bg-blue-100",
  delivered: "text-herbal-700 bg-herbal-100",
  cancelled: "text-rose-600 bg-rose-100",
  pending: "text-muted-foreground bg-cream-200",
};

const TIER_ORDER: LoyaltyTier[] = ["none", "silver", "gold", "vip"];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");
  const [loggingOut, setLoggingOut] = useState(false);

  const { orders, fetchUserOrders, loading: ordersLoading } = useOrders();
  const { addToCart } = useCart();

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => addToCart(item.product, item.quantity));
    toast.success("Items added to cart!");
    navigate("/cart");
  };
  const { wishlist, removeFromWishlist } = useWishlist();
  const { getById } = useProducts();
  const { avatarUrl, uploading, uploadAvatar } = useProfile();
  const { member, rewards, loading: loyaltyLoading, tier, lifetimeSpent, orderCount, saveBirthday } = useLoyalty();

  // Birthday state
  const [bdayMonth, setBdayMonth] = useState("");
  const [bdayDay, setBdayDay] = useState("");
  const [bdaySaving, setBdaySaving] = useState(false);
  const [bdaySaved, setBdaySaved] = useState(false);

  // Parse existing birthday from member
  useEffect(() => {
    if (member?.birthday && !bdaySaved) {
      // birthday stored as "--MM-DD" or "YYYY-MM-DD"
      const parts = member.birthday.replace(/^--/, "0000-").split("-");
      if (parts.length >= 3) {
        setBdayMonth(parts[parts.length - 2] || "");
        setBdayDay(parts[parts.length - 1] || "");
      }
    }
  }, [member?.birthday]);

  const isBirthdayMonth = (() => {
    if (!bdayMonth) return false;
    const now = new Date();
    return now.getMonth() + 1 === parseInt(bdayMonth, 10);
  })();

  const handleSaveBirthday = async () => {
    if (!bdayMonth || !bdayDay) { toast.error("Please select both month and day"); return; }
    setBdaySaving(true);
    const { error } = await saveBirthday(`--${bdayMonth.padStart(2, "0")}-${bdayDay.padStart(2, "0")}`);
    setBdaySaving(false);
    if (error) toast.error("Failed to save birthday");
    else { toast.success("Birthday saved! 🎂"); setBdaySaved(true); }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review state: keyed by `${orderId}-${productId}`
  const [reviewForms, setReviewForms] = useState<Record<string, ReviewFormState>>({});
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());

  const getReviewKey = (orderId: string, productId: string) => `${orderId}-${productId}`;

  const openReviewForm = (orderId: string, productId: string) => {
    const key = getReviewKey(orderId, productId);
    setReviewForms((prev) => ({
      ...prev,
      [key]: prev[key] ?? { rating: 0, hoverRating: 0, comment: "", submitting: false, submitted: false },
    }));
  };

  const closeReviewForm = (orderId: string, productId: string) => {
    const key = getReviewKey(orderId, productId);
    setReviewForms((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateReviewForm = (orderId: string, productId: string, patch: Partial<ReviewFormState>) => {
    const key = getReviewKey(orderId, productId);
    setReviewForms((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  const submitReview = async (orderId: string, productId: string) => {
    const key = getReviewKey(orderId, productId);
    const form = reviewForms[key];
    if (!form || form.rating === 0) { toast.error("Please select a star rating"); return; }
    if (!form.comment.trim()) { toast.error("Please write a short review"); return; }
    updateReviewForm(orderId, productId, { submitting: true });
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      author_name: user?.username || user?.email?.split("@")[0] || "Customer",
      rating: form.rating,
      title: "",
      body: form.comment.trim(),
      verified_purchase: true,
      helpful_count: 0,
    });
    if (error) {
      toast.error("Failed to submit review. Please try again.");
      updateReviewForm(orderId, productId, { submitting: false });
    } else {
      toast.success("Review submitted! Thank you 🌿");
      setSubmittedReviews((prev) => new Set([...prev, key]));
      closeReviewForm(orderId, productId);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    const url = await uploadAvatar(file);
    if (url) toast.success("Profile photo updated!");
    else toast.error("Failed to upload photo");
    e.target.value = "";
  };

  useEffect(() => { fetchUserOrders(); }, [fetchUserOrders]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.signOut();
      logout();
      toast.success("Signed out successfully");
      navigate("/", { replace: true });
    } catch {
      toast.error("Failed to sign out");
      setLoggingOut(false);
    }
  };

  const tabs: { key: Tab; icon: React.ElementType; label: string }[] = [
    { key: "orders", icon: ShoppingBag, label: "My Orders" },
    { key: "wishlist", icon: Heart, label: "Wishlist" },
    { key: "rewards", icon: Crown, label: "Rewards" },
    { key: "profile", icon: User, label: "Profile" },
  ];

  const avatarLetter = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const tierMeta = TIER_META[tier];
  const progress = getTierProgress(lifetimeSpent, tier);
  const nextTierInfo = getNextTier(tier);
  const amountToNext = nextTierInfo.tier
    ? Math.max(0, nextTierInfo.threshold - lifetimeSpent)
    : 0;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero */}
      <section className="page-hero">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar with upload */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold overflow-hidden">
                {avatarUrl || user?.avatar ? (
                  <img src={avatarUrl || user?.avatar} alt={user?.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="font-display text-3xl font-semibold text-white">{avatarLetter}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold-500 hover:bg-gold-600 border-2 border-white flex items-center justify-center shadow-md transition-colors disabled:opacity-70"
                title="Change profile photo"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" capture="user" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-1">
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">{user?.username}</h1>
                {tier !== "none" && <LoyaltyBadge tier={tier} size="sm" />}
              </div>
              <p className="font-sans text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-outline py-2.5 text-sm flex items-center gap-2 text-rose-500 border-rose-200 hover:bg-rose-50 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {tabs.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-4 font-sans text-sm font-medium transition-all text-left",
                    tab === key ? "bg-gold-50 text-gold-700 border-r-2 border-gold-500" : "text-foreground hover:bg-cream-100"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                  {key === "rewards" && tier !== "none" && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-gold-500" />
                  )}
                  {tab === key && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* ── ORDERS TAB ── */}
            {tab === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl font-semibold">My Orders</h2>
                  {ordersLoading && <Loader2 className="w-5 h-5 animate-spin text-gold-500" />}
                </div>
                {ordersLoading && orders.length === 0 ? (
                  <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-display text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="font-sans text-sm text-muted-foreground mb-6">Your orders will appear here once you make a purchase.</p>
                    <Link to="/shop" className="btn-primary py-3 px-6 text-sm">Start Shopping</Link>
                  </div>
                ) : (
                  orders.map((order: Order) => {
                    const StatusIcon = STATUS_ICON[order.status] || Clock;
                    return (
                      <div key={order.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
                          <div>
                            <p className="font-sans text-xs text-muted-foreground mb-1">Order ID</p>
                            <p className="font-mono text-sm font-semibold text-gold-600">{order.id}</p>
                          </div>
                          <div className="hidden sm:block text-right">
                            <p className="font-sans text-xs text-muted-foreground mb-1">Placed on</p>
                            <p className="font-sans text-sm text-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-xs text-muted-foreground mb-1">Total</p>
                            <p className="font-display text-lg font-semibold text-gold-600">{formatPrice(order.finalTotal)}</p>
                          </div>
                          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-semibold capitalize", STATUS_COLOR[order.status] || "bg-cream-200 text-foreground")}>
                            <StatusIcon className="w-3.5 h-3.5" /> {order.status}
                          </span>
                        </div>
                        <div className="p-5 space-y-4">
                          {order.items.map((item) => {
                            const reviewKey = getReviewKey(order.id, item.product.id);
                            const form = reviewForms[reviewKey];
                            const alreadyReviewed = submittedReviews.has(reviewKey);
                            const isDelivered = order.status === "delivered";
                            return (
                              <div key={item.product.id} className="space-y-3">
                                <div className="flex items-center gap-4">
                                  <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" style={{ background: item.product.bgColor }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-sans text-sm font-medium text-foreground truncate">{item.product.name}</p>
                                    <p className="font-sans text-xs text-muted-foreground">Qty: {item.quantity} · {item.product.weight}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <p className="font-sans text-sm font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                                    {isDelivered && order.status !== 'cancelled' && (
                                      alreadyReviewed ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-herbal-100 text-herbal-700 rounded-full font-sans text-xs font-medium">
                                          <CheckCircle className="w-3 h-3" /> Reviewed
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            form ? closeReviewForm(order.id, item.product.id) : openReviewForm(order.id, item.product.id)
                                          }
                                          className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold border transition-all",
                                            form
                                              ? "bg-cream-100 border-border text-muted-foreground hover:bg-cream-200"
                                              : "bg-gold-50 border-gold-300 text-gold-700 hover:bg-gold-100"
                                          )}
                                        >
                                          <PenLine className="w-3 h-3" />
                                          {form ? "Cancel" : "Write Review"}
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Inline review form */}
                                {isDelivered && form && !alreadyReviewed && (
                                  <div className="ml-[72px] bg-gold-50 border border-gold-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                                    <p className="font-sans text-xs font-semibold text-gold-700 uppercase tracking-wider">Rate your experience</p>
                                    <StarPicker
                                      rating={form.rating}
                                      hoverRating={form.hoverRating}
                                      onRate={(r) => updateReviewForm(order.id, item.product.id, { rating: r })}
                                      onHover={(r) => updateReviewForm(order.id, item.product.id, { hoverRating: r })}
                                      onLeave={() => updateReviewForm(order.id, item.product.id, { hoverRating: 0 })}
                                    />
                                    <div className="relative">
                                      <textarea
                                        value={form.comment}
                                        onChange={(e) => updateReviewForm(order.id, item.product.id, { comment: e.target.value })}
                                        placeholder="Share your thoughts on this product — texture, scent, results..."
                                        maxLength={500}
                                        rows={3}
                                        className="w-full resize-none bg-white border border-border rounded-xl px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                                      />
                                      <span className="absolute bottom-3 right-3 font-sans text-[10px] text-muted-foreground">{form.comment.length}/500</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => closeReviewForm(order.id, item.product.id)}
                                        className="btn-outline py-2 px-4 text-xs"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => submitReview(order.id, item.product.id)}
                                        disabled={form.submitting || form.rating === 0}
                                        className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5 disabled:opacity-50"
                                      >
                                        {form.submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                                        {form.submitting ? "Submitting..." : "Submit Review"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {/* Delivery Timeline */}
                        <DeliveryTimeline status={order.status} createdAt={order.createdAt} />

                        {/* Reorder button */}
                        {order.status !== 'cancelled' && (
                          <div className="px-5 pb-3 pt-0">
                            <button
                              onClick={() => handleReorder(order)}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-cream-100 hover:bg-gold-50 border border-border hover:border-gold-300 rounded-xl font-sans text-sm font-medium text-foreground hover:text-gold-700 transition-all"
                            >
                              <RotateCcw className="w-4 h-4" /> Reorder
                            </button>
                          </div>
                        )}

                        <div className="px-5 pb-5">
                          <div className="flex items-start gap-2 p-3 bg-cream-100 rounded-xl">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                              {order.customer.address}, {order.customer.city}, {order.customer.state} – {order.customer.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {tab === "wishlist" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold mb-2">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-display text-lg font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="font-sans text-sm text-muted-foreground mb-6">Save products you love to your wishlist.</p>
                    <Link to="/shop" className="btn-primary py-3 px-6 text-sm">Browse Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((productId) => {
                      const product = getById(productId);
                      if (!product) return null;
                      return (
                        <div key={productId} className="bg-white rounded-2xl shadow-soft overflow-hidden flex">
                          <Link to={`/product/${product.slug}`} className="flex-shrink-0">
                            <img src={product.images[0]} alt={product.name} className="w-24 h-24 object-cover" style={{ background: product.bgColor }} />
                          </Link>
                          <div className="flex-1 p-4 min-w-0">
                            <Link to={`/product/${product.slug}`}>
                              <p className="font-sans text-sm font-semibold text-foreground truncate hover:text-gold-600 transition-colors">{product.name}</p>
                            </Link>
                            <p className="font-display text-base font-semibold text-gold-600 mt-1">{formatPrice(product.price)}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <Link to={`/product/${product.slug}`} className="btn-primary py-1.5 px-3 text-xs">View</Link>
                              <button onClick={() => removeFromWishlist(productId)} className="p-1.5 rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── REWARDS TAB ── */}
            {tab === "rewards" && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-semibold">Loyalty Rewards</h2>

                {loyaltyLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
                ) : (
                  <>
                    {/* VIP celebration */}
                    {tier === "vip" && (
                      <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-rose-600 to-rose-900 p-6 text-white shadow-product">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">👑</div>
                            <div>
                              <p className="font-sans text-xs text-rose-200 uppercase tracking-widest">You've unlocked</p>
                              <h3 className="font-display text-2xl font-bold">VIP Status</h3>
                            </div>
                          </div>
                          <p className="font-sans text-sm text-rose-100 leading-relaxed">
                            Welcome to the elite circle! You enjoy free delivery, surprise gifts, birthday rewards, and priority support. Thank you for your loyalty to TVAKSHRI.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {["20% off", "Free Delivery", "Birthday Reward", "Surprise Gift"].map((perk) => (
                              <span key={perk} className="px-3 py-1 bg-white/15 rounded-full font-sans text-xs text-white border border-white/20">✦ {perk}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tier card */}
                    <div className={cn("bg-white rounded-2xl shadow-soft p-6 border-2", tierMeta.border)}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl", tierMeta.bg)}>
                            {tier === "vip" ? "👑" : tier === "gold" ? "🥇" : tier === "silver" ? "🥈" : "🌱"}
                          </div>
                          <div>
                            <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Current Tier</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {tier === "none" ? (
                                <span className="font-display text-xl font-semibold text-foreground">No Tier Yet</span>
                              ) : (
                                <LoyaltyBadge tier={tier} size="md" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-cream-100 rounded-xl px-4 py-2.5">
                            <p className="font-display text-lg font-bold text-gold-600">{formatPrice(lifetimeSpent)}</p>
                            <p className="font-sans text-xs text-muted-foreground">Lifetime Spent</p>
                          </div>
                          <div className="bg-cream-100 rounded-xl px-4 py-2.5">
                            <p className="font-display text-lg font-bold text-foreground">{orderCount}</p>
                            <p className="font-sans text-xs text-muted-foreground">Orders</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {nextTierInfo.tier && (
                        <div className="mb-5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-sans text-xs text-muted-foreground">
                              Progress to {TIER_META[nextTierInfo.tier].emoji} {TIER_META[nextTierInfo.tier].label}
                            </span>
                            <span className="font-sans text-xs font-semibold text-gold-600">
                              {formatPrice(amountToNext)} more to go
                            </span>
                          </div>
                          <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-gradient rounded-full transition-all duration-700"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <span className="font-sans text-[10px] text-muted-foreground">{formatPrice(lifetimeSpent)}</span>
                            <span className="font-sans text-[10px] text-muted-foreground">{formatPrice(nextTierInfo.threshold)}</span>
                          </div>
                        </div>
                      )}

                      {/* Tier journey */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {(["silver", "gold", "vip"] as LoyaltyTier[]).map((t, i) => {
                          const m = TIER_META[t];
                          const isReached = TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(t);
                          return (
                            <div key={t} className="flex items-center gap-1 flex-shrink-0">
                              {i > 0 && <div className={cn("h-0.5 w-8", isReached ? "bg-gold-400" : "bg-cream-300")} />}
                              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-medium border", isReached ? `${m.bg} ${m.color} ${m.border}` : "bg-cream-100 text-muted-foreground border-border")}>
                                <span>{m.emoji}</span> {m.label}
                                {isReached && <CheckCircle className="w-3 h-3" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                      <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold-500" /> Your {tier === "none" ? "Member" : TIER_META[tier].label} Benefits
                      </h3>
                      <ul className="space-y-2">
                        {TIER_BENEFITS[tier].map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2.5 font-sans text-sm text-foreground">
                            <CheckCircle className="w-4 h-4 text-herbal-500 flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      {tier !== "vip" && nextTierInfo.tier && (
                        <div className="mt-5 pt-4 border-t border-border">
                          <p className="font-sans text-xs text-muted-foreground mb-3 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> Unlock at {TIER_META[nextTierInfo.tier].label}
                          </p>
                          <ul className="space-y-1.5">
                            {TIER_BENEFITS[nextTierInfo.tier].map((benefit) => (
                              <li key={benefit} className="flex items-start gap-2.5 font-sans text-sm text-muted-foreground">
                                <span className="w-4 h-4 rounded-full border-2 border-dashed border-muted-foreground flex-shrink-0 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* ── Birthday Section ── */}
                    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                      {/* Birthday month celebration card */}
                      {isBirthdayMonth && (
                        <div className="relative overflow-hidden">
                          {/* CSS confetti layer */}
                          <style>{`
                            @keyframes confetti-fall {
                              0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
                              100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
                            }
                            .confetti-dot {
                              position: absolute;
                              width: 8px; height: 8px;
                              border-radius: 50%;
                              animation: confetti-fall linear infinite;
                              pointer-events: none;
                            }
                          `}</style>
                          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[
                              { left: "5%",  delay: "0s",    dur: "2.4s", color: "#C9A84C" },
                              { left: "15%", delay: "0.4s",  dur: "2.1s", color: "#e11d48" },
                              { left: "28%", delay: "0.8s",  dur: "2.7s", color: "#4ade80" },
                              { left: "42%", delay: "0.2s",  dur: "2.2s", color: "#C9A84C" },
                              { left: "56%", delay: "0.6s",  dur: "2.5s", color: "#f97316" },
                              { left: "68%", delay: "0.3s",  dur: "2.0s", color: "#e11d48" },
                              { left: "80%", delay: "0.9s",  dur: "2.3s", color: "#4ade80" },
                              { left: "92%", delay: "0.1s",  dur: "2.6s", color: "#C9A84C" },
                              { left: "10%", delay: "1.2s",  dur: "2.1s", color: "#f97316" },
                              { left: "50%", delay: "1.5s",  dur: "2.4s", color: "#e11d48" },
                              { left: "75%", delay: "1.0s",  dur: "2.2s", color: "#4ade80" },
                              { left: "35%", delay: "1.8s",  dur: "2.8s", color: "#C9A84C" },
                            ].map((dot, i) => (
                              <span
                                key={i}
                                className="confetti-dot"
                                style={{
                                  left: dot.left,
                                  top: "-10px",
                                  animationDelay: dot.delay,
                                  animationDuration: dot.dur,
                                  backgroundColor: dot.color,
                                }}
                              />
                            ))}
                          </div>
                          <div className="bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 p-6 text-white relative">
                            <div className="flex items-start gap-4">
                              <div className="text-5xl flex-shrink-0 animate-bounce">🎂</div>
                              <div className="flex-1">
                                <p className="font-sans text-xs font-semibold text-amber-100 uppercase tracking-widest mb-1">Happy Birthday!</p>
                                <h3 className="font-display text-2xl font-bold text-white mb-1">Your Birthday Gift 🎁</h3>
                                <p className="font-sans text-sm text-amber-100 leading-relaxed">
                                  Wishing you a radiant birthday! Enjoy an exclusive 15% off on your next TVAKSHRI order — just for you.
                                </p>
                                <div className="flex items-center gap-3 mt-4">
                                  <div className="flex items-center gap-2 bg-white/20 border border-white/40 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                                    <span className="font-mono text-lg font-bold text-white tracking-widest">BIRTHDAY15</span>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText("BIRTHDAY15"); toast.success("Copied BIRTHDAY15! 🎂"); }}
                                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                      title="Copy code"
                                    >
                                      <Copy className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                  <span className="font-sans text-xs text-amber-100">15% off · No min. order</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Birthday picker */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🎂</span>
                          <h3 className="font-display text-base font-semibold text-foreground">Your Birthday</h3>
                          {member?.birthday && (
                            <span className="ml-auto font-sans text-xs text-herbal-600 bg-herbal-100 px-2 py-0.5 rounded-full">Saved ✓</span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-muted-foreground mb-4">
                          Save your birthday to receive a special 15% off coupon during your birthday month — available to all members.
                        </p>
                        <div className="flex flex-wrap gap-3 items-end">
                          {/* Month */}
                          <div className="flex-1 min-w-[130px]">
                            <label className="font-sans text-xs font-medium text-muted-foreground block mb-1.5">Month</label>
                            <select
                              value={bdayMonth}
                              onChange={(e) => { setBdayMonth(e.target.value); setBdaySaved(false); }}
                              className="input-field text-sm"
                            >
                              <option value="">Select month</option>
                              {[
                                "January","February","March","April","May","June",
                                "July","August","September","October","November","December"
                              ].map((m, i) => (
                                <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                              ))}
                            </select>
                          </div>
                          {/* Day */}
                          <div className="flex-1 min-w-[100px]">
                            <label className="font-sans text-xs font-medium text-muted-foreground block mb-1.5">Day</label>
                            <select
                              value={bdayDay}
                              onChange={(e) => { setBdayDay(e.target.value); setBdaySaved(false); }}
                              className="input-field text-sm"
                            >
                              <option value="">Select day</option>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={handleSaveBirthday}
                            disabled={bdaySaving || !bdayMonth || !bdayDay}
                            className={cn(
                              "px-5 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
                              bdaySaved
                                ? "bg-herbal-100 text-herbal-700 border border-herbal-300"
                                : "btn-primary disabled:opacity-50"
                            )}
                          >
                            {bdaySaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : bdaySaved ? (
                              <>
                                <CheckCircle className="w-4 h-4" /> Saved
                              </>
                            ) : (
                              <>Save Birthday</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Exclusive coupons */}
                    {TIER_EXCLUSIVE_COUPONS[tier].length > 0 && (
                      <div className="bg-white rounded-2xl shadow-soft p-6">
                        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gold-500" /> Exclusive Coupons
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {TIER_EXCLUSIVE_COUPONS[tier].map((code) => (
                            <div
                              key={code}
                              className={cn("flex items-center justify-between p-4 rounded-xl border-2 border-dashed", TIER_META[tier].border, TIER_META[tier].bg)}
                            >
                              <span className={cn("font-mono text-base font-bold tracking-wider", TIER_META[tier].color)}>
                                {code}
                              </span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(code); toast.success(`Copied ${code}!`); }}
                                className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                                title="Copy code"
                              >
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="font-sans text-xs text-muted-foreground mt-3">Apply these codes at checkout to unlock your exclusive discount.</p>
                      </div>
                    )}

                    {/* Free gift eligibility */}
                    {tier === "vip" && (
                      <div className={cn(
                        "rounded-2xl p-5 border-2",
                        member?.free_gift_status === "shipped"
                          ? "bg-herbal-50 border-herbal-300"
                          : member?.free_gift_status === "approved"
                          ? "bg-gold-50 border-gold-300"
                          : member?.free_gift_status === "eligible"
                          ? "bg-rose-50 border-rose-300"
                          : "bg-cream-100 border-border"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl flex-shrink-0">🎁</div>
                          <div>
                            <h4 className="font-sans text-sm font-semibold text-foreground">VIP Surprise Gift</h4>
                            <p className="font-sans text-xs text-muted-foreground mt-0.5">
                              {member?.free_gift_status === "shipped"
                                ? "Your surprise gift has been shipped! Check your delivery."
                                : member?.free_gift_status === "approved"
                                ? "Your gift has been approved and will be included in your next order."
                                : member?.free_gift_status === "eligible"
                                ? "You are eligible for a VIP surprise gift! Our team will reach out soon."
                                : "Reach VIP status to unlock your free surprise gift."}
                            </p>
                          </div>
                          <span className={cn(
                            "ml-auto px-2.5 py-1 rounded-full font-sans text-xs font-semibold capitalize flex-shrink-0",
                            member?.free_gift_status === "shipped" ? "bg-herbal-100 text-herbal-700" :
                            member?.free_gift_status === "approved" ? "bg-gold-100 text-gold-700" :
                            member?.free_gift_status === "eligible" ? "bg-rose-100 text-rose-700" :
                            "bg-cream-200 text-muted-foreground"
                          )}>
                            {member?.free_gift_status === "none" ? "Not yet" : member?.free_gift_status}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rewards from admin */}
                    {rewards.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-soft p-6">
                        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                          <Gift className="w-4 h-4 text-gold-500" /> Your Rewards
                        </h3>
                        <div className="space-y-3">
                          {rewards.map((r) => (
                            <div key={r.id} className="flex items-start gap-3 p-4 bg-cream-50 rounded-xl border border-border">
                              <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-base flex-shrink-0">
                                {r.type === "free_gift" ? "🎁" : r.type === "birthday_reward" ? "🎂" : r.type === "special_coupon" ? "🏷️" : "✨"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-sans text-sm font-semibold text-foreground">{r.title}</p>
                                <p className="font-sans text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.description}</p>
                                {r.coupon_code && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="font-mono text-sm font-bold text-gold-600">{r.coupon_code}</span>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(r.coupon_code!); toast.success("Copied!"); }}
                                      className="p-1 hover:bg-cream-200 rounded transition-colors"
                                    >
                                      <Copy className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <span className={cn(
                                "px-2.5 py-1 rounded-full font-sans text-xs font-semibold capitalize flex-shrink-0",
                                r.status === "approved" || r.status === "claimed" ? "bg-herbal-100 text-herbal-700" :
                                r.status === "shipped" ? "bg-blue-100 text-blue-700" :
                                r.status === "rejected" ? "bg-rose-100 text-rose-600" :
                                "bg-cream-200 text-muted-foreground"
                              )}>
                                {r.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spend more prompt */}
                    {tier === "none" && (
                      <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
                        <p className="font-sans text-sm text-muted-foreground mb-4">
                          Spend {formatPrice(TIER_THRESHOLDS.silver - lifetimeSpent)} more to unlock <strong>Silver</strong> membership and start earning exclusive rewards.
                        </p>
                        <Link to="/shop" className="btn-primary py-3 px-6 text-sm">Shop Now</Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {tab === "profile" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold mb-2">Profile Details</h2>
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold overflow-hidden">
                        {avatarUrl || user?.avatar ? (
                          <img src={avatarUrl || user?.avatar} alt={user?.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="font-display text-2xl font-semibold text-white">{avatarLetter}</span>
                        )}
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-gold-500 hover:bg-gold-600 border-2 border-white flex items-center justify-center shadow transition-colors disabled:opacity-70">
                        {uploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display text-xl font-semibold text-foreground">{user?.username}</h3>
                        {tier !== "none" && <LoyaltyBadge tier={tier} size="sm" />}
                      </div>
                      <p className="font-sans text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <p className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Display Name</p>
                      <p className="font-sans text-sm text-foreground bg-cream-100 rounded-xl px-4 py-3">{user?.username}</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Email Address</p>
                      <p className="font-sans text-sm text-foreground bg-cream-100 rounded-xl px-4 py-3">{user?.email}</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Membership Tier</p>
                      <div className="bg-cream-100 rounded-xl px-4 py-3">
                        {tier === "none" ? <span className="font-sans text-sm text-muted-foreground">No tier yet</span> : <LoyaltyBadge tier={tier} size="sm" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Lifetime Spending</p>
                      <p className="font-sans text-sm font-semibold text-gold-600 bg-cream-100 rounded-xl px-4 py-3">{formatPrice(lifetimeSpent)}</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Orders</p>
                      <p className="font-sans text-sm text-foreground bg-cream-100 rounded-xl px-4 py-3">{orders.length} orders</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Wishlist Items</p>
                      <p className="font-sans text-sm text-foreground bg-cream-100 rounded-xl px-4 py-3">{wishlist.length} saved products</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <Link to="/forgot-password" className="btn-outline py-3 px-6 text-sm inline-flex items-center gap-2">
                      <User className="w-4 h-4" /> Change Password
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
