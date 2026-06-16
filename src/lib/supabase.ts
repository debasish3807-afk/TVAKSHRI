import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = (import.meta.env.VITE_SUPABASE_URL as string) || "https://ytxrgnjiubpdvbdmbbvt.supabase.co";
const supabaseAnonKey: string = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "sb_publishable_3IEvz8dwUuC_5lUlBaFTNQ_Zf5kUpZh";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string;
          description: string;
          long_description: string;
          price: number;
          original_price: number | null;
          images: string[];
          category: string;
          tags: string[];
          ingredients: string[];
          benefits: string[];
          how_to_use: string[];
          skin_type: string[];
          weight: string;
          in_stock: boolean;
          stock_count: number;
          rating: number;
          review_count: number;
          is_bestseller: boolean;
          is_new: boolean;
          accent_color: string;
          bg_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          user_session: string;
          items: unknown;
          subtotal: number;
          shipping_fee: number;
          discount: number;
          total: number;
          coupon_code: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: unknown;
          payment_method: string;
          payment_status: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      wishlist: {
        Row: {
          id: string;
          user_session: string;
          product_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wishlist"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["wishlist"]["Insert"]>;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: "percentage" | "fixed";
          value: number;
          min_order: number;
          max_discount: number | null;
          description: string;
          active: boolean;
          usage_count: number;
          max_usage: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["coupons"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          author_name: string;
          rating: number;
          title: string;
          body: string;
          verified_purchase: boolean;
          helpful_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
    };
  };
};
