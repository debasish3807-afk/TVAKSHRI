import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const LS_KEY = "tvakshri_orders";

const loadLocalOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>(loadLocalOrders);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Persist to localStorage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(orders));
    } catch {
      console.error("Failed to save orders locally");
    }
  }, [orders]);

  const addOrder = useCallback(async (order: Order): Promise<boolean> => {
    // Always keep in local state immediately
    setOrders((prev) => [order, ...prev]);

    // Calculate correct subtotal and shipping fee from items
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    // Shipping is free over ₹999
    const shippingFee = subtotal >= 999 ? 0 : 80;

    // Persist to Supabase
    const { error } = await supabase.from("orders").insert({
      id: order.id,
      user_session: sessionStorage.getItem("tvak_session") ?? "unknown",
      user_id: user?.id ?? null,
      items: order.items as unknown,
      subtotal,
      shipping_fee: shippingFee,
      discount: order.discount,
      total: order.finalTotal,
      coupon_code: order.couponCode ?? null,
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      shipping_address: order.customer as unknown,
      payment_method: order.paymentMethod,
      payment_status: "paid",
      status: order.status,
      notes: null,
    });

    if (error) {
      console.error("Failed to save order to Supabase:", error.message);
      return false;
    }
    console.log("Order saved to Supabase:", order.id);
    return true;
  }, [user?.id]);

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const updateOrderStatus = useCallback(async (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) console.error("Failed to update order status:", error.message);
  }, []);

  // Map a Supabase row to Order type — defined outside component to avoid re-creation
  const mapRow = useCallback((row: Record<string, unknown>): Order => ({
    id: row.id as string,
    items: row.items as Order["items"],
    total: (row.total as number) + (row.discount as number),
    discount: row.discount as number,
    finalTotal: row.total as number,
    couponCode: (row.coupon_code as string) ?? undefined,
    customer: row.shipping_address as Order["customer"],
    paymentMethod: row.payment_method as string,
    status: row.status as Order["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }), []);

  // Fetch orders for the current user (Account page)
  const fetchUserOrders = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setOrders(data.map(mapRow));
    }
    setLoading(false);
  }, [user?.id, mapRow]);

  // Fetch ALL orders (admin use only)
  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setOrders(data.map(mapRow));
    }
    setLoading(false);
  }, [mapRow]);

  return { orders, addOrder, getOrderById, updateOrderStatus, fetchAllOrders, fetchUserOrders, loading };
};
