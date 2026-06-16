import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Zap, ChevronRight, Check, Star, Minus, Plus, Loader2, ThumbsUp, History } from "lucide-react";
import { ProductCard } from "@/components/features/ProductCard";
import { StarRating } from "@/components/features/StarRating";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { supabase } from "@/lib/supabase";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SupabaseReview {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getBySlug, getRelated } = useProducts();
  const product = getBySlug(slug || "");
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { recordView, ids: recentIds } = useRecentlyViewed();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"benefits" | "ingredients" | "howto" | "reviews">("benefits");
  const [qty, setQty] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState<SupabaseReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);

  // Helpful votes — optimistic UI + sessionStorage dedup
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>(() => {
    try {
      const stored = sessionStorage.getItem("tvak_helpful_votes");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());

  const handleHelpful = useCallback(async (reviewId: string) => {
    // Already voted this session — no-op
    if (helpfulVotes[reviewId]) return;
    // Already in-flight
    if (votingIds.has(reviewId)) return;

    // Optimistic update: increment count in local state immediately
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      )
    );
    setVotingIds((prev) => new Set([...prev, reviewId]));

    // Persist vote flag in sessionStorage
    const newVotes = { ...helpfulVotes, [reviewId]: true };
    setHelpfulVotes(newVotes);
    try { sessionStorage.setItem("tvak_helpful_votes", JSON.stringify(newVotes)); } catch { /* ignore */ }

    // Persist to Supabase — read current count first, then increment
    const { data: current } = await supabase
      .from("reviews")
      .select("helpful_count")
      .eq("id", reviewId)
      .maybeSingle();

    if (current !== null) {
      await supabase
        .from("reviews")
        .update({ helpful_count: (current?.helpful_count ?? 0) + 1 })
        .eq("id", reviewId);
    }

    setVotingIds((prev) => { const next = new Set(prev); next.delete(reviewId); return next; });
  }, [helpfulVotes, votingIds]);

  const fetchReviews = useCallback(async (productId: string) => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data as SupabaseReview[]);
    setReviewsLoading(false);
    setReviewsFetched(true);
  }, []);

  useEffect(() => {
    if (product?.id && activeTab === "reviews" && !reviewsFetched) {
      fetchReviews(product.id);
    }
  }, [product?.id, activeTab, reviewsFetched, fetchReviews]);

  // Record this product view
  useEffect(() => {
    if (product?.id) recordView(product.id);
  }, [product?.id]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="font-display text-2xl mb-4">Product not found</h2>
        <Link to="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    </div>
  );

  const related = getRelated(product);
  const wishlisted = isWishlisted(product.id);
  const inCart = isInCart(product.id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/checkout");
  };

  // Rating breakdown
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
    : product.rating;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const tabs = [
    { key: "benefits", label: "Benefits" },
    { key: "ingredients", label: "Ingredients" },
    { key: "howto", label: "How to Use" },
    { key: "reviews", label: `Reviews (${totalReviews > 0 ? totalReviews : product.reviewCount})` },
  ] as const;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Breadcrumb */}
      <div className="container-custom py-4">
        <nav className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
          <Link to="/" className="hover:text-gold-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-gold-600">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container-custom pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ background: product.bgColor }}>
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover animate-fade-in" />
              {discount > 0 && (
                <span className="absolute top-4 left-4 badge bg-rose-500 text-white text-sm px-3 py-1">{discount}% OFF</span>
              )}
              <button onClick={() => toggleWishlist(product.id)}
                className={cn("absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-soft transition-all",
                  wishlisted ? "bg-rose-500 text-white" : "bg-white text-foreground hover:bg-rose-50 hover:text-rose-500")}>
                <Heart className={cn("w-5 h-5", wishlisted && "fill-current")} />
              </button>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={cn("flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all", activeImage === i ? "border-gold-500" : "border-transparent hover:border-gold-300")}>
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="py-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-herbal-100 text-herbal-600">{product.category}</span>
              {product.isBestseller && <span className="badge bg-gold-100 text-gold-700">Bestseller</span>}
              {product.isNew && <span className="badge bg-herbal-500 text-white">New</span>}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">{product.name}</h1>
            <p className="font-sans text-base text-muted-foreground mb-4">{product.tagline}</p>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={avgRating} size="md" />
              <span className="font-sans text-sm text-gold-600 font-semibold">{avgRating.toFixed(1)}</span>
              <span className="font-sans text-sm text-muted-foreground">({totalReviews > 0 ? totalReviews : product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-semibold text-gold-600">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="font-sans text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="badge bg-rose-100 text-rose-600">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            <p className="font-sans text-sm text-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Skin types */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="font-sans text-xs text-muted-foreground font-medium">Skin type:</span>
              {product.skinType.map((s) => (
                <span key={s} className="badge bg-cream-200 text-foreground text-xs">{s}</span>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-sans text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-cream-200 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-sans text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stockCount, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-cream-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="font-sans text-xs text-muted-foreground">{product.stockCount} in stock · {product.weight}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button onClick={() => addToCart(product, qty)} className="flex-1 btn-outline flex items-center justify-center gap-2 py-4">
                <ShoppingBag className="w-5 h-5" />
                {inCart ? "Added to Cart ✓" : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} className="flex-1 btn-primary flex items-center justify-center gap-2 py-4">
                <Zap className="w-5 h-5" /> Buy Now
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-cream-200 rounded-2xl mb-6">
              {[
                { icon: Check, text: "100% Natural Ingredients" },
                { icon: Check, text: "No Parabens or Sulphates" },
                { icon: Check, text: "Dermatologist Tested" },
                { icon: Check, text: "Made in India" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-herbal-500" />
                  <span className="font-sans text-xs text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-0 border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn("px-6 py-3 font-sans text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.key ? "border-gold-500 text-gold-600" : "border-transparent text-muted-foreground hover:text-foreground")}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-8">
            {activeTab === "benefits" && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 p-4 bg-white rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-herbal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-herbal-500" />
                    </div>
                    <span className="font-sans text-sm text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "ingredients" && (
              <div className="space-y-3">
                <p className="font-sans text-sm text-muted-foreground mb-4">All ingredients are 100% natural, carefully sourced and traditionally processed.</p>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing) => (
                    <span key={ing} className="px-3 py-2 bg-white border border-border rounded-xl font-sans text-sm text-foreground hover:border-gold-400 transition-colors">🌿 {ing}</span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "howto" && (
              <ol className="space-y-3">
                {product.howToUse.map((step, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl">
                    <span className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="font-sans text-sm text-foreground leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                  </div>
                ) : (
                  <>
                    {/* Rating summary */}
                    {reviews.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row gap-8 shadow-soft">
                        {/* Average */}
                        <div className="flex flex-col items-center justify-center flex-shrink-0 text-center">
                          <p className="font-display text-6xl font-bold text-gold-600 leading-none">{avgRating.toFixed(1)}</p>
                          <StarRating rating={avgRating} size="md" className="mt-2" />
                          <p className="font-sans text-xs text-muted-foreground mt-1">{reviews.length} verified review{reviews.length !== 1 ? "s" : ""}</p>
                        </div>
                        {/* Breakdown bars */}
                        <div className="flex-1 space-y-2 min-w-0">
                          {ratingCounts.map(({ star, count }) => {
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="font-sans text-xs text-muted-foreground w-3 flex-shrink-0">{star}</span>
                                <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400 flex-shrink-0" />
                                <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gold-400 rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="font-sans text-xs text-muted-foreground w-5 text-right flex-shrink-0">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Review list */}
                    {reviews.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                        <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center text-3xl mx-auto mb-4">⭐</div>
                        <h3 className="font-display text-lg font-semibold mb-2">No reviews yet</h3>
                        <p className="font-sans text-sm text-muted-foreground">
                          Be the first to share your experience! Purchase this product and write a review from your account.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((r) => (
                          <div key={r.id} className="p-5 bg-white rounded-2xl shadow-soft">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center font-display font-semibold text-white text-sm flex-shrink-0">
                                  {r.author_name[0]?.toUpperCase() ?? "C"}
                                </div>
                                <div>
                                  <p className="font-sans text-sm font-semibold text-foreground">{r.author_name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="font-sans text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                                    {r.verified_purchase && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-herbal-100 text-herbal-700 rounded-full font-sans text-[10px] font-medium">
                                        <Check className="w-2.5 h-2.5" /> Verified Purchase
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <StarRating rating={r.rating} size="sm" />
                            </div>
                            {r.title && (
                              <p className="font-sans text-sm font-semibold text-foreground mb-1">{r.title}</p>
                            )}
                            <p className="font-sans text-sm text-foreground leading-relaxed">{r.body}</p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                              {r.helpful_count > 0 ? (
                                <span className="font-sans text-xs text-muted-foreground">
                                  {r.helpful_count} {r.helpful_count === 1 ? "person" : "people"} found this helpful
                                </span>
                              ) : (
                                <span />
                              )}
                              <button
                                onClick={() => handleHelpful(r.id)}
                                disabled={!!helpfulVotes[r.id] || votingIds.has(r.id)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-medium border transition-all",
                                  helpfulVotes[r.id]
                                    ? "bg-gold-100 border-gold-300 text-gold-700 cursor-default"
                                    : votingIds.has(r.id)
                                    ? "bg-cream-100 border-border text-muted-foreground opacity-60 cursor-wait"
                                    : "bg-white border-border text-muted-foreground hover:bg-gold-50 hover:border-gold-300 hover:text-gold-700 active:scale-95"
                                )}
                                aria-label="Mark review as helpful"
                              >
                                <ThumbsUp
                                  className={cn(
                                    "w-3.5 h-3.5 transition-all",
                                    helpfulVotes[r.id] ? "fill-gold-500 text-gold-500" : ""
                                  )}
                                />
                                {helpfulVotes[r.id] ? "Helpful ✓" : "Helpful?"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title mb-8">You may also love</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {(() => {
          const recentProducts = recentIds
            .filter((id) => id !== product.id)
            .map((id) => products.find((p) => p.id === id))
            .filter(Boolean)
            .slice(0, 4) as typeof products;
          if (recentProducts.length === 0) return null;
          return (
            <div className="mt-16">
              <h2 className="section-title mb-2 flex items-center gap-3">
                <History className="w-6 h-6 text-muted-foreground" /> Recently Viewed
              </h2>
              <p className="font-sans text-sm text-muted-foreground mb-8">Products you explored recently</p>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
