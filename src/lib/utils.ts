import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number): string =>
  `₹${price.toLocaleString("en-IN")}`;

export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export const generateOrderId = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TVK-${ts}-${rand}`;
};

export const getDeliveryDate = (daysFromNow = 5): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
};

export const truncate = (text: string, maxLen: number): string =>
  text.length > maxLen ? `${text.substring(0, maxLen)}...` : text;

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const debounce = <T extends (...args: unknown[]) => void>(fn: T, ms: number): T => {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
};
