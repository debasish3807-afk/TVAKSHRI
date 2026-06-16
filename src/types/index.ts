export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  ingredients: string[];
  benefits: string[];
  howToUse: string[];
  skinType: string[];
  weight: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  accentColor: string;
  bgColor: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  active: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  finalTotal: number;
  couponCode?: string;
  customer: CustomerInfo;
  paymentMethod: string;
  paymentId?: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type PaymentMethod = "upi" | "card" | "netbanking";

export interface AdminProduct extends Product {
  createdAt: string;
  updatedAt: string;
  totalSold: number;
  revenue: number;
}
