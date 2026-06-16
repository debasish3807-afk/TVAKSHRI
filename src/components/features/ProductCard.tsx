import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
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

  return (
    <div className={cn("product-card group", className)}>
      {/* Image */}
      <div className="relative overflow-hidden aspect-square" style={{ background: product.bgColor }}>
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isBestseller && (
            <span className="badge bg-gold-500 text-white">Bestseller</span>
          )}
          {product.isNew && (
            <span className="badge bg-herbal-500 text-white">New</span>
          )}
          {discount > 0 && (
            <span className="badge bg-rose-500 text-white">{discount}% off</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-soft",
            wishlisted ? "bg-rose-500 text-white" : "bg-white/90 text-foreground hover:bg-rose-50 hover:text-rose-500"
          )}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("w-4 h-4", wishlisted && "fill-current")} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={cn(
              "w-full py-2.5 rounded-xl text-sm font-semibold font-sans transition-all duration-200 flex items-center justify-center gap-2",
              inCart
                ? "bg-herbal-500 text-white"
                : "bg-white text-foreground hover:bg-gold-500 hover:text-white shadow-soft"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            {inCart ? "Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/product/${product.slug}`} className="hover:text-gold-600 transition-colors">
          <h3 className="font-display text-base font-semibold text-foreground mb-1 leading-tight">{product.name}</h3>
        </Link>
        <p className="font-sans text-xs text-muted-foreground mb-3 line-clamp-2">{product.tagline}</p>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("w-3 h-3", i < Math.floor(product.rating) ? "fill-gold-500 text-gold-500" : "text-cream-400")} />
          ))}
          <span className="font-sans text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-lg font-semibold text-gold-600">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-sans text-sm text-muted-foreground line-through ml-2">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <span className="font-sans text-xs text-muted-foreground">{product.weight}</span>
        </div>
      </div>
    </div>
  );
};
