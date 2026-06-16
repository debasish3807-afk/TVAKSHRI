import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export const StarRating = ({ rating, max = 5, size = "md", interactive = false, onRate, className }: StarRatingProps) => {
  const sizeClass = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" }[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(max)].map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            disabled={!interactive}
            onClick={() => onRate?.(i + 1)}
            className={cn(
              "transition-transform",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default"
            )}
          >
            <Star className={cn(
              sizeClass,
              filled ? "fill-gold-500 text-gold-500" :
              half ? "fill-gold-300 text-gold-300" :
              "text-cream-400 fill-cream-300"
            )} />
          </button>
        );
      })}
    </div>
  );
};
