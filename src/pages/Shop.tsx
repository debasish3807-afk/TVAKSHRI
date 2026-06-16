import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Heart, X, Loader2, SlidersHorizontal, ChevronDown, History } from "lucide-react";
import { ProductCard } from "@/components/features/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState("featured");
  const [showWishlistOnly, setShowWishlistOnly] = useState(searchParams.get("wishlist") === "true");
  const { wishlist } = useWishlist();
  const { products, loading, categories } = useProducts();
  const { ids: recentIds } = useRecentlyViewed();

  const recentProducts = useMemo(() =>
    recentIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 4) as typeof products
  , [recentIds, products]);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearchQuery(s);
    const c = searchParams.get("category");
    if (c) setSelectedCategory(c);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (searchParams.get("filter") === "bestsellers") result = result.filter((p) => p.isBestseller);
    if (searchParams.get("filter") === "new") result = result.filter((p) => p.isNew);
    if (showWishlistOnly) result = result.filter((p) => wishlist.includes(p.id));
    if (selectedCategory !== "All") result = result.filter((p) => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "newest": result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }
    return result;
  }, [searchQuery, selectedCategory, sortBy, showWishlistOnly, wishlist, searchParams, products]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("featured");
    setShowWishlistOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All" || showWishlistOnly;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Pure · Potent · Luxurious</p>
          <h1 className="section-title mb-3">The Herbal Collection</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">Discover our complete range of Ayurvedic face packs, polishes and ritual blends.</p>
        </div>
      </section>

      <div className="container-custom py-8">
        {/* ── Search + Filter bar ── */}
        <div className="bg-white rounded-2xl shadow-soft p-4 mb-6 space-y-4">
          {/* Search row */}
          <div className="relative group">
            <Search className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
              hasSearchQuery ? "text-gold-500" : "text-muted-foreground group-focus-within:text-gold-500"
            )} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ingredient, skin type..."
              className="w-full pl-11 pr-12 py-3.5 bg-cream-50 border border-border rounded-xl font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all"
            />
            {hasSearchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-cream-200 hover:bg-rose-100 flex items-center justify-center transition-colors group/clear"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground group-hover/clear:text-rose-500" />
              </button>
            )}
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Wishlist toggle */}
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-sans font-medium transition-all flex-shrink-0",
                showWishlistOnly
                  ? "bg-rose-500 border-rose-500 text-white shadow-sm"
                  : "bg-cream-50 border-border text-foreground hover:border-rose-300 hover:bg-rose-50"
              )}
            >
              <Heart className={cn("w-4 h-4", showWishlistOnly ? "fill-white" : "")} />
              <span>Saved ({wishlist.length})</span>
            </button>

            {/* Sort */}
            <div className="relative flex-shrink-0">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-cream-50 border border-border rounded-xl text-sm font-sans font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400 appearance-none cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>

            {/* Result count badge */}
            <div className="ml-auto flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-gold-500" />}
              <span className={cn(
                "px-3 py-1 rounded-full font-sans text-xs font-semibold transition-colors",
                filtered.length === 0 ? "bg-rose-100 text-rose-600" : "bg-gold-100 text-gold-700"
              )}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Category chips ── */}
        <div className="relative mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-sans font-medium transition-all flex-shrink-0 snap-start border",
                  selectedCategory === cat
                    ? "bg-gold-500 text-white border-gold-500 shadow-gold"
                    : "bg-white text-foreground border-border hover:border-gold-400 hover:bg-gold-50"
                )}
              >
                {cat}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-full text-sm font-sans font-medium text-rose-500 border border-rose-200 hover:bg-rose-50 flex items-center gap-1.5 transition-all flex-shrink-0 snap-start"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Active search context label */}
        {hasSearchQuery && (
          <div className="flex items-center gap-2 mb-5">
            <span className="font-sans text-sm text-muted-foreground">Results for</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-50 border border-gold-200 rounded-full font-sans text-sm font-semibold text-gold-700">
              "{searchQuery.trim()}"
              <button onClick={clearSearch} className="hover:text-rose-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
                <div className="aspect-square bg-cream-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-cream-200 rounded w-1/3" />
                  <div className="h-5 bg-cream-200 rounded w-2/3" />
                  <div className="h-3 bg-cream-200 rounded w-full" />
                  <div className="h-6 bg-cream-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center text-4xl mx-auto mb-5">🔍</div>
            {hasSearchQuery ? (
              <>
                <h3 className="font-display text-xl font-semibold mb-2">No results for "{searchQuery.trim()}"</h3>
                <p className="font-sans text-sm text-muted-foreground mb-3 max-w-sm mx-auto">
                  We couldn't find any products matching your search. Try different keywords or browse by category.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <button onClick={clearSearch} className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2">
                    <X className="w-4 h-4" /> Clear search
                  </button>
                  <button onClick={clearFilters} className="btn-primary py-2.5 px-5 text-sm">Browse all products</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
                <p className="font-sans text-sm text-muted-foreground mb-6">Try adjusting your filters to see more results.</p>
                <button onClick={clearFilters} className="btn-primary py-2.5 px-6 text-sm">Clear Filters</button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Recently Viewed */}
        {!loading && recentProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-display text-xl font-semibold">Recently Viewed</h2>
              </div>
              <Link to="#" onClick={() => window.location.reload()} className="font-sans text-xs text-gold-600 hover:text-gold-700 transition-colors">Clear history</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
