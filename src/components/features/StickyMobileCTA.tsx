import { ShoppingBag, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

interface StickyMobileCTAProps {
  product: Product;
  qty: number;
  inCart: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function StickyMobileCTA({ product, qty, inCart, onAddToCart, onBuyNow }: StickyMobileCTAProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => {
      // Show sticky CTA after scrolling past ~400px (product image zone)
      setShow(window.scrollY > 420);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-border shadow-product transition-all duration-300 safe-bottom",
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <div className="container-custom py-3 flex items-center gap-3">
        {/* Product mini info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            style={{ background: product.bgColor }}
          />
          <div className="min-w-0">
            <p className="font-sans text-xs font-semibold text-foreground truncate">{product.name}</p>
            <p className="font-display text-sm font-bold text-gold-600">{formatPrice(product.price * qty)}</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onAddToCart}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold border-2 transition-all active:scale-95",
              inCart
                ? "border-herbal-500 text-herbal-600 bg-herbal-50"
                : "border-gold-500 text-gold-600 bg-white hover:bg-gold-50"
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {inCart ? "Added ✓" : "Add"}
          </button>
          <button
            onClick={onBuyNow}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-500 text-white font-sans text-xs font-semibold hover:bg-gold-600 active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
