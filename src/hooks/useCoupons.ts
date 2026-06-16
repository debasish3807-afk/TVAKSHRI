import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Coupon } from "@/types";

export const useCoupons = () => {
  const [loading, setLoading] = useState(false);

  const validateCoupon = useCallback(async (
    code: string,
    orderTotal: number
  ): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; error?: string }> => {
    setLoading(true);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("active", true)
      .ilike("code", code)
      .single();

    setLoading(false);

    if (error || !data) {
      // Fallback to local coupons if Supabase unavailable
      const { validateCoupon: localValidate, calculateDiscount: localCalc } = await import("@/constants/coupons");
      const result = localValidate(code, orderTotal);
      if (result.valid && result.coupon) {
        return { valid: true, coupon: result.coupon, discount: localCalc(result.coupon, orderTotal) };
      }
      return { valid: false, error: result.error ?? "Invalid coupon code" };
    }

    const coupon: Coupon = {
      code: data.code,
      type: data.type as "percentage" | "fixed",
      value: Number(data.value),
      minOrder: Number(data.min_order),
      maxDiscount: data.max_discount ? Number(data.max_discount) : undefined,
      description: data.description,
      active: data.active,
    };

    if (orderTotal < coupon.minOrder) {
      return { valid: false, error: `Minimum order of ₹${coupon.minOrder} required` };
    }

    if (data.max_usage && data.usage_count >= data.max_usage) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (orderTotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, orderTotal);

    return { valid: true, coupon, discount };
  }, []);

  /** Safely increment usage_count without requiring an RPC function */
  const incrementUsage = useCallback(async (code: string) => {
    // Fetch current count first, then increment — avoids needing a DB function
    const { data } = await supabase
      .from("coupons")
      .select("usage_count")
      .ilike("code", code)
      .maybeSingle();
    if (data !== null && data !== undefined) {
      await supabase
        .from("coupons")
        .update({ usage_count: (data.usage_count ?? 0) + 1 })
        .ilike("code", code);
    }
  }, []);

  // Admin: fetch all coupons
  const fetchAllCoupons = useCallback(async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  }, []);

  const createCoupon = useCallback(async (coupon: Omit<Coupon, "active"> & { active?: boolean }) => {
    const { data, error } = await supabase.from("coupons").insert({
      code: coupon.code.toUpperCase(),
      type: coupon.type,
      value: coupon.value,
      min_order: coupon.minOrder,
      max_discount: coupon.maxDiscount ?? null,
      description: coupon.description,
      active: coupon.active ?? true,
    }).select().single();
    return { data, error };
  }, []);

  const toggleCoupon = useCallback(async (id: string, active: boolean) => {
    const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
    return { error };
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    return { error };
  }, []);

  return { validateCoupon, incrementUsage, fetchAllCoupons, createCoupon, toggleCoupon, deleteCoupon, loading };
};
