
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package, ShoppingBag, Tag, BarChart3, Plus, Trash2,
  TrendingUp, Users, Star, Loader2, RefreshCw, Check, X,
  Crown, Gift, ChevronDown, ChevronUp, Send, Save, ToggleLeft, ToggleRight, Award, Sparkles,
  TrendingDown, Eye, AlertTriangle, Download, DollarSign, ShoppingCart,
  Activity, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useProducts, useAdminProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useCoupons } from "@/hooks/useCoupons";
import { useAdminLoyalty, TIER_META, type LoyaltyTier, type LoyaltyReward } from "@/hooks/useLoyalty";
import { LoyaltyBadge } from "@/components/features/LoyaltyBadge";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Coupon } from "@/types";

type Tab = "dashboard" | "analytics" | "products" | "orders" | "coupons" | "loyalty";

// ── Chart colours ─────────────────────────────────────────────────────────────
const CHART_COLORS = ["#C9A84C", "#2D6B14", "#E08B00", "#9B0D0D", "#4A90D9", "#7C4DFF"];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color: string; bg: string; trend?: { value: number; label: string };
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-semibold font-sans",
            trend.value >= 0 ? "text-herbal-600" : "text-rose-500"
          )}>
            {trend.value >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="font-sans text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold text-foreground mt-0.5">{value}</p>
      {sub && <p className="font-sans text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ── Inline-editable product row ───────────────────────────────────────────────
interface ProductDraft {
  name: string;
  price: string;
  stock_count: string;
  in_stock: boolean;
  is_bestseller: boolean;
  is_new: boolean;
}

function ProductRow({
  product,
  onDelete,
}: {
  product: ReturnType<typeof useProducts>["products"][0];
  onDelete: (id: string, name: string) => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>({
    name: product.name,
    price: String(product.price),
    stock_count: String(product.stockCount),
    in_stock: product.inStock,
    is_bestseller: product.isBestseller ?? false,
    is_new: product.isNew ?? false,
  });
  const [saving, setSaving] = useState(false);

  const isDirty =
    draft.name !== product.name ||
    draft.price !== String(product.price) ||
    draft.stock_count !== String(product.stockCount) ||
    draft.in_stock !== product.inStock ||
    draft.is_bestseller !== (product.isBestseller ?? false) ||
    draft.is_new !== (product.isNew ?? false);

  const toggle = (field: keyof Pick<ProductDraft, "in_stock" | "is_bestseller" | "is_new">) =>
    setDraft((d) => ({ ...d, [field]: !d[field] }));

  const handleSave = useCallback(async () => {
    const priceNum = parseFloat(draft.price);
    const stockNum = parseInt(draft.stock_count, 10);
    if (!draft.name.trim()) { toast.error("Name cannot be empty"); return; }
    if (isNaN(priceNum) || priceNum < 0) { toast.error("Invalid price"); return; }
    if (isNaN(stockNum) || stockNum < 0) { toast.error("Invalid stock count"); return; }

    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: draft.name.trim(),
        price: priceNum,
        stock_count: stockNum,
        in_stock: draft.in_stock,
        is_bestseller: draft.is_bestseller,
        is_new: draft.is_new,
      })
      .eq("id", product.id);

    setSaving(false);
    if (error) {
      toast.error(`Save failed: ${error.message}`);
    } else {
      toast.success(`${draft.name} updated`);
    }
  }, [draft, product.id]);

  // Low-stock warning
  const stockNum = parseInt(draft.stock_count, 10);
  const stockStatus = stockNum === 0 ? "out" : stockNum <= 5 ? "low" : "ok";

  return (
    <tr className="hover:bg-cream-50 transition-colors group">
      <td className="px-4 py-3 min-w-[200px]">
        <div className="flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            style={{ background: product.bgColor }}
            loading="lazy"
          />
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-gold-400 focus:bg-white rounded-sm px-1 py-0.5 font-sans text-sm font-medium text-foreground focus:outline-none transition-all"
            title="Edit name"
          />
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="badge bg-cream-200 text-foreground text-xs">{product.category}</span>
      </td>
      <td className="px-4 py-3 min-w-[100px]">
        <div className="flex items-center gap-1">
          <span className="font-sans text-sm text-muted-foreground">₹</span>
          <input
            type="number"
            min="0"
            step="1"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className="w-20 bg-transparent border-b border-transparent hover:border-border focus:border-gold-400 focus:bg-white rounded-sm px-1 py-0.5 font-sans text-sm font-semibold text-gold-600 focus:outline-none transition-all text-right"
            title="Edit price"
          />
        </div>
      </td>
      <td className="px-4 py-3 min-w-[100px]">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="1"
            value={draft.stock_count}
            onChange={(e) => setDraft((d) => ({ ...d, stock_count: e.target.value }))}
            className="w-16 bg-transparent border-b border-transparent hover:border-border focus:border-gold-400 focus:bg-white rounded-sm px-1 py-0.5 font-sans text-sm text-foreground focus:outline-none transition-all text-center"
            title="Edit stock count"
          />
          {stockStatus === "out" && (
            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded text-[10px] font-semibold whitespace-nowrap">Out</span>
          )}
          {stockStatus === "low" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold whitespace-nowrap">
              <AlertTriangle className="w-2.5 h-2.5" /> Low
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
          <span className="font-sans text-sm">{product.rating}</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={() => toggle("in_stock")}
          title={draft.in_stock ? "Click to mark Out of Stock" : "Click to mark In Stock"}
          className="flex items-center gap-1.5 transition-colors"
        >
          {draft.in_stock ? (
            <ToggleRight className="w-6 h-6 text-herbal-500" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-muted-foreground" />
          )}
          <span className={cn("font-sans text-xs font-semibold", draft.in_stock ? "text-herbal-600" : "text-muted-foreground")}>
            {draft.in_stock ? "In Stock" : "Out"}
          </span>
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={() => toggle("is_bestseller")}
          title="Toggle Bestseller"
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full font-sans text-xs font-semibold border transition-all",
            draft.is_bestseller
              ? "bg-gold-100 text-gold-700 border-gold-300"
              : "bg-cream-100 text-muted-foreground border-border hover:border-gold-300"
          )}
        >
          <Award className="w-3 h-3" />
          {draft.is_bestseller ? "Yes" : "No"}
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={() => toggle("is_new")}
          title="Toggle New badge"
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full font-sans text-xs font-semibold border transition-all",
            draft.is_new
              ? "bg-herbal-100 text-herbal-700 border-herbal-300"
              : "bg-cream-100 text-muted-foreground border-border hover:border-herbal-300"
          )}
        >
          <Sparkles className="w-3 h-3" />
          {draft.is_new ? "New" : "No"}
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            title={isDirty ? "Save changes" : "No changes"}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all",
              isDirty && !saving
                ? "bg-gold-500 text-white hover:bg-gold-600 shadow-sm"
                : "bg-cream-200 text-muted-foreground cursor-not-allowed"
            )}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => onDelete(product.id, product.name)}
            title="Delete product"
            className="p-1.5 rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductsTab({
  products,
  loading,
  deleteProduct,
}: {
  products: ReturnType<typeof useProducts>["products"];
  loading: boolean;
  deleteProduct: (id: string) => Promise<{ error: unknown }>;
}) {
  const lowStockCount = products.filter((p) => p.stockCount > 0 && p.stockCount <= 5).length;
  const outOfStockCount = products.filter((p) => p.stockCount === 0).length;

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
      const { error } = await deleteProduct(id);
      if (!error) toast.success("Product deleted");
      else toast.error("Delete failed");
    },
    [deleteProduct]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Products ({products.length})</h2>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">Click any field to edit inline, then press Save on that row.</p>
        </div>
        <div className="flex items-center gap-3">
          {outOfStockCount > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-600 rounded-xl font-sans text-xs font-semibold">
              <AlertTriangle className="w-3 h-3" /> {outOfStockCount} out of stock
            </span>
          )}
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl font-sans text-xs font-semibold">
              <AlertTriangle className="w-3 h-3" /> {lowStockCount} low stock
            </span>
          )}
          {loading && <Loader2 className="w-5 h-5 animate-spin text-gold-500" />}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-sans text-muted-foreground">No products found in the database.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream-100">
                  {[
                    { label: "Product", hint: "" },
                    { label: "Category", hint: "" },
                    { label: "Price (₹)", hint: "Editable" },
                    { label: "Stock", hint: "Editable" },
                    { label: "Rating", hint: "" },
                    { label: "In Stock", hint: "Toggle" },
                    { label: "Bestseller", hint: "Toggle" },
                    { label: "New", hint: "Toggle" },
                    { label: "Actions", hint: "" },
                  ].map(({ label, hint }) => (
                    <th key={label} className="px-4 py-3 text-left">
                      <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                      {hint && <span className="ml-1 font-sans text-[9px] text-gold-500 uppercase">{hint}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <ProductRow key={p.id} product={p} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-cream-50 border-t border-border">
            <p className="font-sans text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-gold-600 font-semibold"><Save className="w-3 h-3" /> Save</span>
              {" "} button appears when a row has unsaved changes. Rows with stock ≤5 show a Low Stock warning.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ orders, members, products, coupons }: {
  orders: ReturnType<typeof useOrders>["orders"];
  members: ReturnType<typeof useAdminLoyalty>["members"];
  products: ReturnType<typeof useProducts>["products"];
  coupons: (Coupon & { id?: string; usage_count?: number })[];
}) {
  // Revenue by day (last 7 days)
  const revenueByDay = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      days[key] = 0;
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const dayDiff = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (dayDiff < 7) {
        const key = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
        days[key] = (days[key] ?? 0) + o.finalTotal;
      }
    });
    return Object.entries(days).map(([day, revenue]) => ({ day, revenue }));
  }, [orders]);

  // Orders by status
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [orders]);

  // Products by category
  const productsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => { counts[p.category] = (counts[p.category] ?? 0) + 1; });
    return Object.entries(counts).map(([cat, count]) => ({ name: cat, value: count }));
  }, [products]);

  // Loyalty tiers breakdown
  const tierBreakdown = useMemo(() => {
    const counts: Record<string, number> = { none: 0, silver: 0, gold: 0, vip: 0 };
    members.forEach((m) => { counts[m.tier] = (counts[m.tier] ?? 0) + 1; });
    return [
      { name: "No Tier", value: counts.none, color: "#94a3b8" },
      { name: "Silver", value: counts.silver, color: "#94a3b8" },
      { name: "Gold", value: counts.gold, color: "#C9A84C" },
      { name: "VIP", value: counts.vip, color: "#e11d48" },
    ].filter((t) => t.value > 0);
  }, [members]);

  // Top products by review count / rating
  const topProducts = useMemo(() =>
    [...products]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5)
  , [products]);

  // Low stock products
  const lowStockProducts = useMemo(() =>
    products.filter((p) => p.stockCount <= 5).sort((a, b) => a.stockCount - b.stockCount)
  , [products]);

  // Revenue stats
  const now = new Date();
  const todayRevenue = orders
    .filter((o) => new Date(o.createdAt).toDateString() === now.toDateString())
    .reduce((s, o) => s + o.finalTotal, 0);
  const monthRevenue = orders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + o.finalTotal, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.finalTotal, 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === now.toDateString()).length;
  const monthOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Most used coupons
  const couponStats = coupons
    .filter((c) => (c as Record<string, unknown>).usage_count)
    .map((c) => ({ code: c.code, uses: (c as Record<string, unknown>).usage_count as number }))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 5);

  // Export orders as CSV
  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Phone", "Total", "Status", "Date"];
    const rows = orders.map((o) => [
      o.id,
      o.customer.name,
      o.customer.email,
      o.customer.phone,
      o.finalTotal,
      o.status,
      new Date(o.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tvakshri-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported as CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Analytics Overview</h2>
        <button onClick={exportCSV} className="btn-outline py-2 text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Orders CSV
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(totalRevenue)} sub={`Avg: ${formatPrice(avgOrderValue)} per order`} color="text-gold-600" bg="bg-gold-100" />
        <StatCard icon={TrendingUp} label="Today's Revenue" value={formatPrice(todayRevenue)} sub={`${todayOrders} orders today`} color="text-herbal-600" bg="bg-herbal-100" />
        <StatCard icon={Activity} label="Monthly Revenue" value={formatPrice(monthRevenue)} sub={`${monthOrders} orders this month`} color="text-blue-600" bg="bg-blue-100" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={String(orders.length)} sub={`${members.length} loyalty members`} color="text-rose-600" bg="bg-rose-100" />
      </div>

      {/* Revenue chart + Order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-display text-base font-semibold mb-4">Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: "sans-serif" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "sans-serif" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => [formatPrice(v), "Revenue"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5d5b5" }}
              />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-display text-base font-semibold mb-4">Orders by Status</h3>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status} (${count})`}
                  labelLine={false}
                >
                  {ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground font-sans text-sm">
              No orders yet
            </div>
          )}
        </div>
      </div>

      {/* Loyalty tier chart + Products by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-display text-base font-semibold mb-4">Loyalty Tier Distribution</h3>
          {tierBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tierBreakdown} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {tierBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground font-sans text-sm">
              No members yet
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-display text-base font-semibold mb-4">Products by Category</h3>
          {productsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={productsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {productsByCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground font-sans text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Top products + Low stock + Coupon usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-gold-500" /> Top Products
          </h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 font-display text-sm font-bold text-muted-foreground">{i + 1}</span>
                <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" style={{ background: p.bgColor }} loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-gold-500 text-gold-500" />
                    <span className="font-sans text-[10px] text-muted-foreground">{p.rating} · {p.reviewCount} reviews</span>
                  </div>
                </div>
                <span className="font-sans text-xs font-semibold text-gold-600">{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Stock Alerts
          </h3>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <Check className="w-8 h-8 text-herbal-500 mx-auto mb-2" />
              <p className="font-sans text-sm text-muted-foreground">All products well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" style={{ background: p.bgColor }} loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs font-semibold text-foreground truncate">{p.name}</p>
                    <p className="font-sans text-[10px] text-muted-foreground">{p.category}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-sans text-[10px] font-bold",
                    p.stockCount === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"
                  )}>
                    {p.stockCount === 0 ? "Out" : `${p.stockCount} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupon usage */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-herbal-500" /> Coupon Usage
          </h3>
          {couponStats.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground text-center py-8">No coupons used yet</p>
          ) : (
            <div className="space-y-3">
              {couponStats.map((c) => (
                <div key={c.code} className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gold-600 w-24 truncate">{c.code}</span>
                  <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-400 rounded-full"
                      style={{ width: `${Math.min(100, (c.uses / (couponStats[0]?.uses || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="font-sans text-xs text-muted-foreground w-8 text-right">{c.uses}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-herbal-100 text-herbal-700",
  processing: "bg-saffron-100 text-saffron-600",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-herbal-100 text-herbal-700",
  cancelled: "bg-rose-100 text-rose-600",
  pending: "bg-cream-300 text-foreground",
};

// ── Main Admin component ──────────────────────────────────────────────────────

export default function Admin() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const { products, loading: productsLoading } = useProducts();
  const { orders, updateOrderStatus, fetchAllOrders, loading: ordersLoading } = useOrders();
  const { deleteProduct } = useAdminProducts();
  const { fetchAllCoupons, createCoupon, toggleCoupon, deleteCoupon } = useCoupons();
  const {
    members, allRewards, loading: loyaltyLoading,
    fetchAllMembers, fetchAllRewards,
    updateMemberTier, updateFreeGiftStatus,
    updateRewardStatus, assignReward, updateMemberNotes
  } = useAdminLoyalty();

  const [coupons, setCoupons] = useState<(Coupon & { id?: string; usage_count?: number })[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", type: "percentage" as "percentage" | "fixed", value: 10, minOrder: 500, description: "" });

  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [newReward, setNewReward] = useState({ type: "special_coupon", title: "", description: "", coupon_code: "", discount_value: "" });
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [memberNotes, setMemberNotes] = useState<Record<string, string>>({});

  // Order search/filter
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (orderStatusFilter !== "all") result = result.filter((o) => o.status === orderStatusFilter);
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      result = result.filter(
        (o) => o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, orderSearch, orderStatusFilter]);

  useEffect(() => {
    if (authenticated) {
      fetchAllOrders();
      loadCoupons();
    }
  }, [authenticated, fetchAllOrders]);

  const loadCoupons = async () => {
    setCouponsLoading(true);
    const { data } = await fetchAllCoupons();
    if (data) {
      setCoupons(data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        code: c.code as string,
        type: c.type as "percentage" | "fixed",
        value: Number(c.value),
        minOrder: Number(c.min_order),
        maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
        description: c.description as string,
        active: Boolean(c.active),
        usage_count: Number(c.usage_count ?? 0),
      })));
    }
    setCouponsLoading(false);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.finalTotal, 0);
  const totalOrders = orders.length;
  const vipCount = members.filter((m) => m.tier === "vip").length;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check lockout
    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast.error(`Too many failed attempts. Wait ${Math.ceil(secs / 60)} minute(s).`);
      return;
    }

    if (password === "admin123") {
      setAuthenticated(true);
      setLoginAttempts(0);
    } else {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 5) {
        setLockedUntil(Date.now() + 15 * 60 * 1000);
        toast.error("Too many failed attempts. Admin locked for 15 minutes.");
      } else {
        toast.error(`Incorrect password. ${5 - attempts} attempt${5 - attempts !== 1 ? "s" : ""} remaining.`);
      }
    }
    setPassword("");
  };

  if (!authenticated) {
    const isLocked = lockedUntil && Date.now() < lockedUntil;
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-product p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Admin Login</h1>
            <p className="font-sans text-sm text-muted-foreground mt-1">TVAKSHRI Dashboard</p>
          </div>
          {isLocked && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="font-sans text-xs text-rose-600 text-center">
                Admin locked. Try again in {Math.ceil(((lockedUntil! - Date.now()) / 60000))} minute(s).
              </p>
            </div>
          )}
          <form onSubmit={handleAdminLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="input-field mb-3"
              disabled={!!isLocked}
              autoComplete="current-password"
            />
            <button type="submit" className="btn-primary w-full py-3" disabled={!!isLocked}>Login</button>
            <p className="font-sans text-xs text-muted-foreground text-center mt-3">Demo password: admin123</p>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; icon: typeof Package; label: string }[] = [
    { key: "dashboard", icon: BarChart3, label: "Dashboard" },
    { key: "analytics", icon: Activity, label: "Analytics" },
    { key: "products", icon: Package, label: "Products" },
    { key: "orders", icon: ShoppingBag, label: "Orders" },
    { key: "coupons", icon: Tag, label: "Coupons" },
    { key: "loyalty", icon: Crown, label: "Loyalty" },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <div className="bg-foreground text-cream-100 py-6">
        <div className="container-custom flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-cream-100">Admin Dashboard</h1>
            <p className="font-sans text-xs text-cream-400">TVAKSHRI Herbal Skincare · Supabase Connected</p>
          </div>
          <button onClick={() => setAuthenticated(false)} className="font-sans text-sm text-cream-400 hover:text-cream-100 transition-colors">Logout</button>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)} className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
              tab === key ? "bg-gold-500 text-white shadow-gold" : "bg-white text-foreground hover:bg-cream-200 shadow-soft"
            )}>
              <Icon className="w-4 h-4" /> {label}
              {key === "loyalty" && vipCount > 0 && (
                <span className="ml-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{vipCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: TrendingUp, label: "Total Revenue", value: formatPrice(totalRevenue), color: "text-gold-600", bg: "bg-gold-100" },
                { icon: ShoppingBag, label: "Total Orders", value: totalOrders.toString(), color: "text-herbal-600", bg: "bg-herbal-100" },
                { icon: Package, label: "Active Products", value: products.filter((p) => p.inStock).length.toString(), color: "text-blue-600", bg: "bg-blue-100" },
                { icon: Crown, label: "VIP Members", value: vipCount.toString(), color: "text-rose-600", bg: "bg-rose-100" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-soft">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="font-sans text-xs text-muted-foreground">{label}</p>
                  <p className="font-display text-2xl font-semibold text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Product Performance</h3>
                {productsLoading && <Loader2 className="w-4 h-4 animate-spin text-gold-500" />}
              </div>
              <div className="divide-y divide-border">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4">
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" style={{ background: p.bgColor }} loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="font-sans text-xs text-muted-foreground">{p.category} · {p.weight}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-sans text-sm font-semibold text-gold-600">{formatPrice(p.price)}</p>
                      <p className="font-sans text-xs text-muted-foreground">{p.stockCount} in stock</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                      <span className="font-sans text-xs text-foreground">{p.rating}</span>
                    </div>
                    <span className={cn("badge", p.inStock ? "bg-herbal-100 text-herbal-700" : "bg-rose-100 text-rose-600")}>
                      {p.inStock ? "In Stock" : "Out"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <AnalyticsTab orders={orders} members={members} products={products} coupons={coupons} />
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && <ProductsTab products={products} loading={productsLoading} deleteProduct={deleteProduct} />}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold">Orders ({filteredOrders.length}{orders.length !== filteredOrders.length ? ` of ${orders.length}` : ""})</h2>
              <button onClick={fetchAllOrders} disabled={ordersLoading} className="btn-outline py-2 text-sm flex items-center gap-2">
                <RefreshCw className={cn("w-4 h-4", ordersLoading && "animate-spin")} /> Refresh
              </button>
            </div>

            {/* Search & filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order ID, name or email..."
                className="input-field flex-1 text-sm"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="input-field sm:w-44 text-sm"
              >
                <option value="all">All Statuses</option>
                {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-sans text-muted-foreground">
                  {orderSearch || orderStatusFilter !== "all" ? "No orders match your search." : "No orders yet."}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-cream-100">
                        {["Order ID", "Customer", "Items", "Total", "Payment", "Date", "Status", "Action"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-cream-50 transition-colors">
                          <td className="px-4 py-3 font-sans text-xs font-mono text-gold-600">{o.id.slice(0, 12)}...</td>
                          <td className="px-4 py-3">
                            <p className="font-sans text-sm font-medium text-foreground">{o.customer.name}</p>
                            <p className="font-sans text-xs text-muted-foreground">{o.customer.phone}</p>
                          </td>
                          <td className="px-4 py-3 font-sans text-sm text-foreground">{o.items.length} item{o.items.length !== 1 ? "s" : ""}</td>
                          <td className="px-4 py-3 font-sans text-sm font-semibold text-gold-600">{formatPrice(o.finalTotal)}</td>
                          <td className="px-4 py-3"><span className="badge bg-cream-200 text-foreground text-xs capitalize">{o.paymentMethod}</span></td>
                          <td className="px-4 py-3 font-sans text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
                          <td className="px-4 py-3">
                            <span className={cn("badge text-xs", STATUS_COLORS[o.status] || "bg-cream-200 text-foreground")}>{o.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as typeof o.status)}
                              className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gold-400"
                            >
                              {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COUPONS ── */}
        {tab === "coupons" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Coupons ({coupons.length})</h2>
              <button onClick={() => setShowAddCoupon(true)} className="btn-primary flex items-center gap-2 py-2.5 text-sm">
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>
            {showAddCoupon && (
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gold-200">
                <h3 className="font-display text-lg font-semibold mb-4">New Coupon</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Code *</label>
                    <input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} className="input-field" placeholder="SAVE20" />
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Type</label>
                    <select value={newCoupon.type} onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as "percentage" | "fixed" })} className="input-field">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Value *</label>
                    <input type="number" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })} className="input-field" />
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Min. Order (₹)</label>
                    <input type="number" value={newCoupon.minOrder} onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })} className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-sans text-sm font-medium text-foreground block mb-1.5">Description</label>
                    <input value={newCoupon.description} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} className="input-field" placeholder="e.g. 20% off on all orders" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={async () => {
                    if (!newCoupon.code.trim()) { toast.error("Coupon code required"); return; }
                    const { error } = await createCoupon({ ...newCoupon, active: true });
                    if (!error) {
                      toast.success("Coupon created!");
                      setShowAddCoupon(false);
                      setNewCoupon({ code: "", type: "percentage", value: 10, minOrder: 500, description: "" });
                      loadCoupons();
                    } else { toast.error("Failed to create coupon"); }
                  }} className="btn-primary py-2.5 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" /> Save Coupon
                  </button>
                  <button onClick={() => setShowAddCoupon(false)} className="btn-ghost py-2.5 text-sm flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            )}
            {couponsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.code} className="bg-white rounded-2xl p-5 shadow-soft border border-dashed border-gold-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-lg font-bold text-gold-600 tracking-wider">{c.code}</span>
                      <button
                        onClick={async () => {
                          if (!c.id) return;
                          await toggleCoupon(c.id, !c.active);
                          loadCoupons();
                        }}
                        className={cn("badge text-xs cursor-pointer transition-all", c.active ? "bg-herbal-100 text-herbal-700 hover:bg-herbal-200" : "bg-rose-100 text-rose-600 hover:bg-rose-200")}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <p className="font-sans text-sm text-foreground font-medium mb-1">
                      {c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}
                      {c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground mb-1">Min. order: {formatPrice(c.minOrder)}</p>
                    {c.usage_count !== undefined && (
                      <p className="font-sans text-xs text-muted-foreground mb-2">Used: {c.usage_count} time{c.usage_count !== 1 ? "s" : ""}</p>
                    )}
                    <p className="font-sans text-xs text-muted-foreground italic">{c.description}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={async () => {
                          if (!c.id || !confirm(`Delete coupon ${c.code}?`)) return;
                          const { error } = await deleteCoupon(c.id);
                          if (!error) { toast.success("Coupon deleted"); loadCoupons(); }
                          else toast.error("Delete failed");
                        }}
                        className="flex-1 btn-ghost py-1.5 text-xs rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LOYALTY ── */}
        {tab === "loyalty" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Loyalty Members</h2>
              <button onClick={() => { fetchAllMembers(); fetchAllRewards(); }} disabled={loyaltyLoading} className="btn-outline py-2 text-sm flex items-center gap-2">
                <RefreshCw className={cn("w-4 h-4", loyaltyLoading && "animate-spin")} /> Refresh
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["silver", "gold", "vip", "none"] as LoyaltyTier[]).map((tier) => {
                const count = members.filter((m) => m.tier === tier).length;
                const meta = TIER_META[tier];
                return (
                  <div key={tier} className={cn("rounded-xl p-4 border", meta.bg, meta.border)}>
                    <p className={cn("font-display text-2xl font-bold", meta.color)}>{count}</p>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5">
                      {meta.emoji} {meta.label} {tier !== "none" ? "Members" : "No Tier"}
                    </p>
                  </div>
                );
              })}
            </div>

            {loyaltyLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
            ) : members.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-sans text-muted-foreground">No loyalty members yet. Members are created when users place orders.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                    <div
                      className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 cursor-pointer hover:bg-cream-50 transition-colors"
                      onClick={() => setExpandedMember(expandedMember === m.id ? null : m.id)}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg flex-shrink-0", TIER_META[m.tier as LoyaltyTier].bg, TIER_META[m.tier as LoyaltyTier].color)}>
                        {m.customer_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-sans text-sm font-semibold text-foreground">{m.customer_name || "Customer"}</p>
                          {m.tier !== "none" && <LoyaltyBadge tier={m.tier as LoyaltyTier} size="sm" />}
                        </div>
                        <p className="font-sans text-xs text-muted-foreground">{m.customer_email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="font-display text-sm font-bold text-gold-600">{formatPrice(m.lifetime_spent)}</p>
                          <p className="font-sans text-xs text-muted-foreground">{m.order_count} orders</p>
                        </div>
                        {m.free_gift_status !== "none" && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full font-sans text-xs font-medium capitalize",
                            m.free_gift_status === "shipped" ? "bg-herbal-100 text-herbal-700" :
                            m.free_gift_status === "approved" ? "bg-gold-100 text-gold-700" :
                            "bg-rose-100 text-rose-600"
                          )}>
                            🎁 {m.free_gift_status}
                          </span>
                        )}
                        {expandedMember === m.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {expandedMember === m.id && (
                      <div className="border-t border-border p-5 space-y-4 bg-cream-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Membership Tier</label>
                            <div className="flex gap-2 flex-wrap">
                              {(["none", "silver", "gold", "vip"] as LoyaltyTier[]).map((t) => (
                                <button
                                  key={t}
                                  onClick={async () => {
                                    const { error } = await updateMemberTier(m.user_id, t);
                                    if (!error) toast.success(`Tier updated to ${t}`);
                                    else toast.error("Failed to update tier");
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-sans text-xs font-semibold border transition-all",
                                    m.tier === t
                                      ? `${TIER_META[t].bg} ${TIER_META[t].color} ${TIER_META[t].border}`
                                      : "bg-white text-muted-foreground border-border hover:border-gold-300"
                                  )}
                                >
                                  {TIER_META[t].emoji} {TIER_META[t].label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Free Gift Status</label>
                            <div className="flex gap-2 flex-wrap">
                              {(["none", "eligible", "approved", "shipped"] as const).map((status) => (
                                <button
                                  key={status}
                                  onClick={async () => {
                                    const { error } = await updateFreeGiftStatus(m.user_id, status);
                                    if (!error) toast.success(`Gift status → ${status}`);
                                    else toast.error("Update failed");
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-sans text-xs font-semibold border transition-all capitalize",
                                    m.free_gift_status === status
                                      ? "bg-gold-100 text-gold-700 border-gold-300"
                                      : "bg-white text-muted-foreground border-border hover:border-gold-300"
                                  )}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Admin Notes</label>
                          <div className="flex gap-2">
                            <input
                              value={memberNotes[m.user_id] ?? m.notes ?? ""}
                              onChange={(e) => setMemberNotes({ ...memberNotes, [m.user_id]: e.target.value })}
                              placeholder="Add internal notes about this customer..."
                              className="input-field flex-1 text-sm"
                            />
                            <button
                              onClick={async () => {
                                const notes = memberNotes[m.user_id] ?? m.notes ?? "";
                                const { error } = await updateMemberNotes(m.user_id, notes);
                                if (!error) toast.success("Notes saved");
                                else toast.error("Failed to save notes");
                              }}
                              className="btn-primary py-2.5 px-4 text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        {assigningUserId === m.user_id ? (
                          <div className="bg-white rounded-xl p-4 border border-gold-200">
                            <h4 className="font-sans text-sm font-semibold text-foreground mb-3">Assign New Reward</h4>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-sans text-xs text-muted-foreground block mb-1">Type</label>
                                  <select value={newReward.type} onChange={(e) => setNewReward({ ...newReward, type: e.target.value })} className="input-field text-sm">
                                    <option value="special_coupon">Special Coupon</option>
                                    <option value="free_gift">Free Gift</option>
                                    <option value="custom_discount">Custom Discount</option>
                                    <option value="birthday_reward">Birthday Reward</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="font-sans text-xs text-muted-foreground block mb-1">Coupon Code</label>
                                  <input value={newReward.coupon_code} onChange={(e) => setNewReward({ ...newReward, coupon_code: e.target.value.toUpperCase() })} className="input-field text-sm" placeholder="e.g. SPECIAL20" />
                                </div>
                              </div>
                              <div>
                                <label className="font-sans text-xs text-muted-foreground block mb-1">Title</label>
                                <input value={newReward.title} onChange={(e) => setNewReward({ ...newReward, title: e.target.value })} className="input-field text-sm" placeholder="e.g. VIP Special Discount" />
                              </div>
                              <div>
                                <label className="font-sans text-xs text-muted-foreground block mb-1">Description</label>
                                <input value={newReward.description} onChange={(e) => setNewReward({ ...newReward, description: e.target.value })} className="input-field text-sm" placeholder="Describe the reward..." />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={async () => {
                                    if (!newReward.title) { toast.error("Title required"); return; }
                                    const { error } = await assignReward(m.user_id, {
                                      type: newReward.type,
                                      title: newReward.title,
                                      description: newReward.description,
                                      coupon_code: newReward.coupon_code || undefined,
                                      discount_value: newReward.discount_value ? Number(newReward.discount_value) : undefined,
                                    });
                                    if (!error) {
                                      toast.success("Reward assigned!");
                                      setAssigningUserId(null);
                                      setNewReward({ type: "special_coupon", title: "", description: "", coupon_code: "", discount_value: "" });
                                    } else { toast.error("Failed to assign reward"); }
                                  }}
                                  className="btn-primary py-2 text-sm flex items-center gap-1.5"
                                >
                                  <Send className="w-3.5 h-3.5" /> Assign Reward
                                </button>
                                <button onClick={() => setAssigningUserId(null)} className="btn-ghost py-2 text-sm">Cancel</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningUserId(m.user_id)}
                            className="btn-outline py-2 text-sm flex items-center gap-2 w-full justify-center"
                          >
                            <Gift className="w-4 h-4" /> Assign Reward / Special Coupon
                          </button>
                        )}

                        {allRewards.filter((r) => r.user_id === m.user_id).length > 0 && (
                          <div>
                            <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rewards History</p>
                            <div className="space-y-2">
                              {allRewards.filter((r) => r.user_id === m.user_id).map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-border">
                                  <div>
                                    <p className="font-sans text-sm font-medium text-foreground">{r.title}</p>
                                    {r.coupon_code && <p className="font-mono text-xs text-gold-600">{r.coupon_code}</p>}
                                    <p className="font-sans text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full font-sans text-xs font-medium capitalize",
                                      r.status === "approved" ? "bg-gold-100 text-gold-700" :
                                      r.status === "shipped" ? "bg-herbal-100 text-herbal-700" :
                                      r.status === "rejected" ? "bg-rose-100 text-rose-600" :
                                      "bg-cream-200 text-muted-foreground"
                                    )}>
                                      {r.status}
                                    </span>
                                    {r.status === "pending" && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={async () => { await updateRewardStatus(r.id, "approved"); toast.success("Reward approved"); }}
                                          className="p-1 rounded hover:bg-herbal-50 text-herbal-600"
                                          title="Approve"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={async () => { await updateRewardStatus(r.id, "rejected"); toast.success("Reward rejected"); }}
                                          className="p-1 rounded hover:bg-rose-50 text-rose-500"
                                          title="Reject"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    {r.status === "approved" && (
                                      <button
                                        onClick={async () => { await updateRewardStatus(r.id, "shipped"); toast.success("Marked as shipped"); }}
                                        className="px-2 py-0.5 rounded text-xs font-sans bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                      >
                                        Mark Shipped
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
