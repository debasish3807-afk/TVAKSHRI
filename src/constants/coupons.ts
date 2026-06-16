import type { Coupon } from "@/types";

export const COUPONS: Coupon[] = [
  {
    code: "TVAK10",
    type: "percentage",
    value: 10,
    minOrder: 500,
    maxDiscount: 200,
    description: "10% off on orders above ₹500",
    active: true,
  },
  {
    code: "FIRST15",
    type: "percentage",
    value: 15,
    minOrder: 700,
    maxDiscount: 300,
    description: "15% off for first-time customers",
    active: true,
  },
  {
    code: "BRIDE100",
    type: "fixed",
    value: 100,
    minOrder: 800,
    description: "₹100 off on bridal ritual orders",
    active: true,
  },
  {
    code: "GLOW200",
    type: "fixed",
    value: 200,
    minOrder: 1500,
    description: "₹200 off on orders above ₹1500",
    active: true,
  },
  {
    code: "WELCOME5",
    type: "percentage",
    value: 5,
    minOrder: 300,
    description: "5% welcome discount — no minimum order",
    active: true,
  },
];

export const validateCoupon = (code: string, orderTotal: number): { valid: boolean; coupon?: Coupon; error?: string } => {
  const coupon = COUPONS.find((c) => c.code.toLowerCase() === code.toLowerCase() && c.active);
  if (!coupon) return { valid: false, error: "Invalid coupon code" };
  if (orderTotal < coupon.minOrder) return { valid: false, error: `Minimum order of ₹${coupon.minOrder} required` };
  return { valid: true, coupon };
};

export const calculateDiscount = (coupon: Coupon, orderTotal: number): number => {
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (orderTotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  return Math.min(discount, orderTotal);
};
