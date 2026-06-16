/**
 * Input sanitization utilities.
 * Prevents XSS, SQL injection patterns, and enforces field formats.
 * Note: React already escapes JSX output; these helpers sanitize
 * data before it's stored in Supabase or used in dynamic contexts.
 */

/** Strip HTML tags and dangerous characters from a string */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")          // strip HTML tags
    .replace(/[<>"'`]/g, "")          // remove common XSS vectors
    .trim();
}

/** Sanitize for display — escape for safe rendering */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Validate and sanitize an Indian phone number — digits only, 10 chars */
export function sanitizePhone(input: string): string {
  return input.replace(/\D/g, "").slice(0, 10);
}

/** Validate and sanitize a 6-digit Indian pincode */
export function sanitizePincode(input: string): string {
  return input.replace(/\D/g, "").slice(0, 6);
}

/** Normalize email to lowercase and trim */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/** Sanitize a coupon code — uppercase alphanumeric only */
export function sanitizeCouponCode(input: string): string {
  return input.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 20);
}

/** Detect if a string contains SQL injection patterns */
export function hasSQLInjection(input: string): boolean {
  const patterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bTRUNCATE\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b)\s+[\d'"]/i,
    /UNION\s+SELECT/i,
  ];
  return patterns.some((p) => p.test(input));
}

/** Validate order ID format */
export function isValidOrderId(id: string): boolean {
  return /^TVK-[A-Z0-9]+-[A-Z0-9]+$/.test(id.trim());
}

/** Rate limiter for actions (in-memory, resets on page reload) */
const _actionTimestamps: Record<string, number[]> = {};

export function rateLimit(key: string, maxPerMinute = 5): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  _actionTimestamps[key] = (_actionTimestamps[key] ?? [])
    .filter((t) => t > windowStart);
  if (_actionTimestamps[key].length >= maxPerMinute) return false;
  _actionTimestamps[key].push(now);
  return true;
}
