import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, Eye, Zap } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const inCart = isInCart(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stockStatus = !product.inStock
    ? "out"
    : product.stockCount <= 5
    ? "low"
    : "ok";

  return (
    <article className={cn("product-card group relative", className)}>
      {/* ── Image ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: product.bgColor, aspectRatio: "1 / 1" }}
      >
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
          />
          {/* Dark overlay on hover for readability */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        </Link>

        {/* ── Badges ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestseller && (
            <span className="badge bg-gold-500 text-white shadow-sm">⭐ Bestseller</span>
          )}
          {product.isNew && (
            <span className="badge bg-herbal-500 text-white shadow-sm">New</span>
          )}
          {discount > 0 && (
            <span className="badge bg-rose-500 text-white shadow-sm">{discount}% off</span>
          )}
          {stockStatus === "out" && (
            <span className="badge bg-foreground text-white shadow-sm">Out of Stock</span>
          )}
          {stockStatus === "low" && stockStatus !== "out" && (
            <span className="badge bg-saffron-400 text-white shadow-sm">Only {product.stockCount} left</span>
          )}
        </div>

        {/* ── Wishlist btn ── */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            "absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-soft",
            wishlisted
              ? "bg-rose-500 text-white scale-110"
              : "bg-white/90 text-foreground hover:bg-rose-50 hover:text-rose-500 hover:scale-110"
          )}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
        >
          <Heart className={cn("w-4 h-4 transition-transform", wishlisted && "fill-current")} />
        </button>

        {/* ── Hover action panel ── */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="flex gap-2">
            <Link
              to={`/product/${product.slug}`}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all duration-200 flex items-center justify-center gap-1.5 bg-white/95 text-foreground hover:bg-cream-100 shadow-soft active:scale-95"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </Link>
            <button
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all duration-200 flex items-center justify-center gap-1.5 shadow-soft active:scale-95",
                inCart
                  ? "bg-herbal-500 text-white"
                  : !product.inStock
                  ? "bg-cream-300 text-muted-foreground cursor-not-allowed"
                  : "bg-gold-500 text-white hover:bg-gold-600"
              )}
              aria-label={inCart ? "Already in cart" : `Add ${product.name} to cart`}
            >
              {inCart ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Added ✓
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4">
        <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>

        <Link to={`/product/${product.slug}`} className="block group/link">
          <h3 className="font-display text-base font-semibold text-foreground mb-1 leading-tight group-hover/link:text-gold-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="font-sans text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {product.tagline}
        </p>

        {/* Star rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3 transition-colors",
                  i < Math.floor(product.rating)
                    ? "fill-gold-500 text-gold-500"
                    : i < product.rating
                    ? "fill-gold-300 text-gold-300"
                    : "text-cream-400 fill-cream-300"
                )}
              />
            ))}
          </div>
          <span className="font-sans text-xs font-semibold text-gold-600">{product.rating.toFixed(1)}</span>
          <span className="font-sans text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-gold-600">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-sans text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <span className="font-sans text-[10px] text-muted-foreground bg-cream-200 px-2 py-1 rounded-full">
            {product.weight}
          </span>
        </div>
      </div>

      {/* Bottom mobile CTA — always visible on touch */}
      <div className="px-4 pb-4 sm:hidden">
        <button
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
          className={cn(
            "w-full py-2.5 rounded-xl font-sans text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5",
            inCart
              ? "bg-herbal-100 text-herbal-600 border border-herbal-300"
              : !product.inStock
              ? "bg-cream-200 text-muted-foreground cursor-not-allowed"
              : "bg-gold-500 text-white shadow-gold hover:bg-gold-600"
          )}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {inCart ? "Added to Cart ✓" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
};
