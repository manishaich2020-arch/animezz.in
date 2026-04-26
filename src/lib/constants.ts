export const SITE_NAME = "OtakuVault";
export const SITE_DESCRIPTION = "Premium anime merchandise — figures, mouse pads, swords & more";
export const DEFAULT_ACCENT = "#a855f7";
export const MIN_ORDER_THRESHOLD = Number(process.env.MIN_ORDER_THRESHOLD ?? 300);
export const SHIPPING_FEE = 99;
export const FREE_SHIPPING_ABOVE = 999;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export const PRODUCT_CATEGORIES = [
  "Mouse Pads",
  "Action Figures",
  "Mini Figures",
  "Swords & Prop Replicas",
  "Wall Art",
  "Apparel",
  "Keychains & Accessories",
  "Manga & Art Books",
  "Phone Cases",
  "Stickers & Prints",
] as const;

export const PAYU_BASE_URL =
  process.env.PAYU_BASE_URL ?? "https://test.payu.in";
