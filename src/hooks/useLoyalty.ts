import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export type LoyaltyTier = "none" | "silver" | "gold" | "vip";

export interface LoyaltyMember {
  id: string;
  user_id: string;
  tier: LoyaltyTier;
  lifetime_spent: number;
  order_count: number;
  birthday: string | null;
  notes: string;
  free_gift_status: "none" | "eligible" | "approved" | "shipped";
  created_at: string;
  updated_at: string;
}

export interface LoyaltyReward {
  id: string;
  user_id: string;
  type: string;
  status: "pending" | "approved" | "shipped" | "claimed" | "rejected";
  title: string;
  description: string;
  coupon_code: string | null;
  discount_value: number | null;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

// Tier thresholds
export const TIER_THRESHOLDS = {
  silver: 1000,
  gold: 3000,
  vip: 5000,
};

export const TIER_META = {
  none: {
    label: "No Tier",
    color: "text-muted-foreground",
    bg: "bg-cream-200",
    border: "border-border",
    gradient: "from-cream-200 to-cream-300",
    emoji: "🌱",
  },
  silver: {
    label: "Silver",
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-300",
    gradient: "from-slate-200 to-slate-400",
    emoji: "🥈",
  },
  gold: {
    label: "Gold",
    color: "text-gold-700",
    bg: "bg-gold-100",
    border: "border-gold-300",
    gradient: "from-gold-300 to-gold-500",
    emoji: "🥇",
  },
  vip: {
    label: "VIP",
    color: "text-rose-700",
    bg: "bg-rose-100",
    border: "border-rose-300",
    gradient: "from-rose-400 to-rose-700",
    emoji: "👑",
  },
};

export const TIER_BENEFITS: Record<LoyaltyTier, string[]> = {
  none: ["Standard pricing", "Access to all products", "Order tracking"],
  silver: [
    "5% exclusive discount (SILVER5)",
    "Early sale notifications",
    "Basic member offers",
    "Priority customer support",
  ],
  gold: [
    "15% exclusive discount (GOLD15)",
    "Early access to new arrivals",
    "Exclusive sale access",
    "Priority offers & bundles",
    "Special seasonal gifts",
  ],
  vip: [
    "20% exclusive discount (VIP20)",
    "Free delivery on all orders (VIPSHIP)",
    "Surprise gift eligibility",
    "Birthday reward coupon (BIRTHDAY15)",
    "VIP-only flash sales",
    "Premium priority support",
    "Personalized skincare consultation",
  ],
};

export const TIER_EXCLUSIVE_COUPONS: Record<LoyaltyTier, string[]> = {
  none: [],
  silver: ["SILVER5"],
  gold: ["GOLD15"],
  vip: ["VIP20", "VIPSHIP", "BIRTHDAY15"],
};

export const calculateTier = (lifetimeSpent: number): LoyaltyTier => {
  if (lifetimeSpent >= TIER_THRESHOLDS.vip) return "vip";
  if (lifetimeSpent >= TIER_THRESHOLDS.gold) return "gold";
  if (lifetimeSpent >= TIER_THRESHOLDS.silver) return "silver";
  return "none";
};

export const getNextTier = (tier: LoyaltyTier): { tier: LoyaltyTier | null; threshold: number } => {
  if (tier === "vip") return { tier: null, threshold: 0 };
  if (tier === "gold") return { tier: "vip", threshold: TIER_THRESHOLDS.vip };
  if (tier === "silver") return { tier: "gold", threshold: TIER_THRESHOLDS.gold };
  return { tier: "silver", threshold: TIER_THRESHOLDS.silver };
};

export const getTierProgress = (lifetimeSpent: number, tier: LoyaltyTier): number => {
  if (tier === "vip") return 100;
  const { threshold } = getNextTier(tier);
  const prevThreshold =
    tier === "gold"
      ? TIER_THRESHOLDS.gold
      : tier === "silver"
      ? TIER_THRESHOLDS.silver
      : 0;
  if (threshold === 0) return 100;
  const range = threshold - prevThreshold;
  const progress = ((lifetimeSpent - prevThreshold) / range) * 100;
  return Math.min(100, Math.max(0, progress));
};

export function useLoyalty() {
  const { user } = useAuth();
  const [member, setMember] = useState<LoyaltyMember | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLoyalty = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("loyalty_members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setMember(data as LoyaltyMember);
    } else if (!error && !data) {
      // Create a new loyalty record for this user
      const newMember = {
        user_id: user.id,
        tier: "none" as LoyaltyTier,
        lifetime_spent: 0,
        order_count: 0,
        free_gift_status: "none" as const,
        notes: "",
      };
      const { data: created } = await supabase
        .from("loyalty_members")
        .insert(newMember)
        .select()
        .single();
      if (created) setMember(created as LoyaltyMember);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchRewards = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("loyalty_rewards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRewards(data as LoyaltyReward[]);
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchLoyalty();
      fetchRewards();
    }
  }, [user?.id]);

  /** Call after a successful order to update lifetime spend & tier */
  const recordOrderSpend = useCallback(
    async (orderTotal: number) => {
      if (!user?.id) return;
      // Always read current values fresh from Supabase to avoid stale-closure issues
      const { data: freshData } = await supabase
        .from("loyalty_members")
        .select("lifetime_spent, order_count, tier, free_gift_status")
        .eq("user_id", user.id)
        .maybeSingle();
      const currentSpent = freshData?.lifetime_spent ?? member?.lifetime_spent ?? 0;
      const currentCount = freshData?.order_count ?? member?.order_count ?? 0;
      const newSpent = currentSpent + orderTotal;
      const newTier = calculateTier(newSpent);
      const newCount = currentCount + 1;

      // Determine free_gift_status
      const currentTier = freshData?.tier ?? member?.tier ?? "none";
      const currentFreeGift = freshData?.free_gift_status ?? member?.free_gift_status ?? "none";
      const wasVip = currentTier === "vip";
      const isNowVip = newTier === "vip";
      const freeGiftStatus =
        isNowVip && currentFreeGift === "none" ? "eligible" : currentFreeGift;

      const { data, error } = await supabase
        .from("loyalty_members")
        .upsert(
          {
            user_id: user.id,
            tier: newTier,
            lifetime_spent: newSpent,
            order_count: newCount,
            free_gift_status: freeGiftStatus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (!error && data) {
        setMember(data as LoyaltyMember);
        // If just became VIP, create a free gift reward
        if (!wasVip && isNowVip) {
          await supabase.from("loyalty_rewards").insert({
            user_id: user.id,
            type: "free_gift",
            status: "pending",
            title: "VIP Welcome Gift 🎁",
            description: "Congratulations on reaching VIP! You are eligible for a surprise free gift with your next order.",
            admin_notes: "",
          });
          await fetchRewards();
        }
      }
    },
    [user?.id, member, fetchRewards]
  );

  /** Save birthday date string (e.g. "--07-15" or "1990-07-15") to Supabase */
  const saveBirthday = useCallback(async (birthday: string): Promise<{ error: unknown }> => {
    if (!user?.id) return { error: "Not logged in" };
    const { error } = await supabase
      .from("loyalty_members")
      .update({ birthday, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (!error) {
      setMember((prev) => prev ? { ...prev, birthday } : prev);
    }
    return { error };
  }, [user?.id]);

  return {
    member,
    rewards,
    loading,
    fetchLoyalty,
    fetchRewards,
    recordOrderSpend,
    saveBirthday,
    tier: member ? calculateTier(member.lifetime_spent) : ("none" as LoyaltyTier),
    lifetimeSpent: member?.lifetime_spent ?? 0,
    orderCount: member?.order_count ?? 0,
  };
}

// ─── ADMIN LOYALTY HOOK ──────────────────────────────────────────────────────

export interface AdminLoyaltyMember extends LoyaltyMember {
  // enriched from orders
  customer_name?: string;
  customer_email?: string;
}

export function useAdminLoyalty() {
  const [members, setMembers] = useState<AdminLoyaltyMember[]>([]);
  const [allRewards, setAllRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllMembers = useCallback(async () => {
    setLoading(true);
    const { data: loyaltyData } = await supabase
      .from("loyalty_members")
      .select("*")
      .order("lifetime_spent", { ascending: false });

    if (loyaltyData) {
      // Enrich with customer info from orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("user_id, customer_name, customer_email")
        .not("user_id", "is", null);

      const ordersByUser: Record<string, { name: string; email: string }> = {};
      if (ordersData) {
        for (const o of ordersData) {
          if (o.user_id && !ordersByUser[o.user_id]) {
            ordersByUser[o.user_id] = { name: o.customer_name, email: o.customer_email };
          }
        }
      }

      const enriched = loyaltyData.map((m: Record<string, unknown>) => ({
        ...(m as unknown as LoyaltyMember),
        customer_name: ordersByUser[m.user_id as string]?.name ?? "Customer",
        customer_email: ordersByUser[m.user_id as string]?.email ?? "—",
      }));
      setMembers(enriched);
    }
    setLoading(false);
  }, []);

  const fetchAllRewards = useCallback(async () => {
    const { data } = await supabase
      .from("loyalty_rewards")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAllRewards(data as LoyaltyReward[]);
  }, []);

  useEffect(() => {
    fetchAllMembers();
    fetchAllRewards();
  }, []);

  const updateMemberTier = async (userId: string, tier: LoyaltyTier) => {
    const { error } = await supabase
      .from("loyalty_members")
      .update({ tier, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (!error) await fetchAllMembers();
    return { error };
  };

  const updateFreeGiftStatus = async (
    userId: string,
    status: LoyaltyMember["free_gift_status"]
  ) => {
    const { error } = await supabase
      .from("loyalty_members")
      .update({ free_gift_status: status, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (!error) await fetchAllMembers();
    return { error };
  };

  const updateRewardStatus = async (
    rewardId: string,
    status: LoyaltyReward["status"],
    adminNotes?: string
  ) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;
    const { error } = await supabase
      .from("loyalty_rewards")
      .update(updates)
      .eq("id", rewardId);
    if (!error) await fetchAllRewards();
    return { error };
  };

  const assignReward = async (
    userId: string,
    reward: {
      type: string;
      title: string;
      description: string;
      coupon_code?: string;
      discount_value?: number;
    }
  ) => {
    const { error } = await supabase.from("loyalty_rewards").insert({
      user_id: userId,
      type: reward.type,
      status: "approved",
      title: reward.title,
      description: reward.description,
      coupon_code: reward.coupon_code ?? null,
      discount_value: reward.discount_value ?? null,
      admin_notes: "Assigned by admin",
    });
    if (!error) await fetchAllRewards();
    return { error };
  };

  const updateMemberNotes = async (userId: string, notes: string) => {
    const { error } = await supabase
      .from("loyalty_members")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (!error) await fetchAllMembers();
    return { error };
  };

  return {
    members,
    allRewards,
    loading,
    fetchAllMembers,
    fetchAllRewards,
    updateMemberTier,
    updateFreeGiftStatus,
    updateRewardStatus,
    assignReward,
    updateMemberNotes,
  };
}
