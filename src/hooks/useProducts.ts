import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PRODUCTS, CATEGORIES, getProductBySlug, getRelatedProducts } from "@/constants/products";
import type { Product } from "@/types";

// Maps a Supabase DB row to the Product type used in the app
const mapDbProduct = (row: Record<string, unknown>): Product => ({
  id: row.id as string,
  name: row.name as string,
  slug: row.slug as string,
  tagline: row.tagline as string,
  description: row.description as string,
  longDescription: (row.long_description as string) ?? "",
  price: Number(row.price),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  images: (row.images as string[]) ?? [],
  category: row.category as string,
  tags: (row.tags as string[]) ?? [],
  ingredients: (row.ingredients as string[]) ?? [],
  benefits: (row.benefits as string[]) ?? [],
  howToUse: (row.how_to_use as string[]) ?? [],
  skinType: (row.skin_type as string[]) ?? [],
  weight: row.weight as string,
  inStock: Boolean(row.in_stock),
  stockCount: Number(row.stock_count),
  rating: Number(row.rating),
  reviewCount: Number(row.review_count),
  isBestseller: Boolean(row.is_bestseller),
  isNew: Boolean(row.is_new),
  accentColor: (row.accent_color as string) ?? "#C9A84C",
  bgColor: (row.bg_color as string) ?? "#FFF8F0",
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS); // Start with local data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (dbError) {
        console.warn("Supabase products fetch failed, using local data:", dbError.message);
        setError(dbError.message);
        setProducts(PRODUCTS); // fallback to static data
      } else if (data && data.length > 0) {
        console.log(`Loaded ${data.length} products from Supabase`);
        setProducts(data.map(mapDbProduct));
        setError(null);
      } else {
        // DB has no products yet — fall back to static
        setProducts(PRODUCTS);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const getBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );

  const getRelated = useCallback(
    (product: Product) =>
      products.filter(
        (p) =>
          p.id !== product.id &&
          (p.category === product.category ||
            p.tags.some((t) => product.tags.includes(t)))
      ).slice(0, 3),
    [products]
  );

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  return { products, loading, error, getBySlug, getRelated, getById, categories };
};

// Hook for admin product management
export const useAdminProducts = () => {
  const [saving, setSaving] = useState(false);

  const createProduct = async (product: Omit<Product, "id">) => {
    setSaving(true);
    const { data, error } = await supabase.from("products").insert({
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      description: product.description,
      long_description: product.longDescription,
      price: product.price,
      original_price: product.originalPrice ?? null,
      images: product.images,
      category: product.category,
      tags: product.tags,
      ingredients: product.ingredients,
      benefits: product.benefits,
      how_to_use: product.howToUse,
      skin_type: product.skinType,
      weight: product.weight,
      in_stock: product.inStock,
      stock_count: product.stockCount,
      rating: product.rating,
      review_count: product.reviewCount,
      is_bestseller: product.isBestseller ?? false,
      is_new: product.isNew ?? false,
      accent_color: product.accentColor,
      bg_color: product.bgColor,
    }).select().single();
    setSaving(false);
    return { data, error };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setSaving(true);
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
    if (updates.stockCount !== undefined) dbUpdates.stock_count = updates.stockCount;
    if (updates.isBestseller !== undefined) dbUpdates.is_bestseller = updates.isBestseller;
    if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    setSaving(false);
    return { data, error };
  };

  const deleteProduct = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from("products").delete().eq("id", id);
    setSaving(false);
    return { error };
  };

  const updateStock = async (id: string, stockCount: number, inStock: boolean) => {
    return updateProduct(id, { stockCount, inStock });
  };

  return { createProduct, updateProduct, deleteProduct, updateStock, saving };
};
