import { cn } from "@/lib/utils";
import { TIER_META, type LoyaltyTier } from "@/hooks/useLoyalty";

interface LoyaltyBadgeProps {
  tier: LoyaltyTier;
  size?: "sm" | "md" | "lg";
  showEmoji?: boolean;
  className?: string;
}

export function LoyaltyBadge({ tier, size = "md", showEmoji = true, className }: LoyaltyBadgeProps) {
  const meta = TIER_META[tier];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  if (tier === "none") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-sans font-semibold border",
        meta.bg,
        meta.color,
        meta.border,
        sizeClasses[size],
        className
      )}
    >
      {showEmoji && <span>{meta.emoji}</span>}
      {meta.label} Member
    </span>
  );
}
