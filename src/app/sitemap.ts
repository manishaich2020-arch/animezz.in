import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://animezz.in";

export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${APP_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${APP_URL}/cart`, lastModified: new Date(), changeFrequency: "never", priority: 0.3 },
    { url: `${APP_URL}/auth/login`, lastModified: new Date(), changeFrequency: "never", priority: 0.3 },
    { url: `${APP_URL}/auth/register`, lastModified: new Date(), changeFrequency: "never", priority: 0.3 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${APP_URL}/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${APP_URL}/shipping`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    // Product pages
    const allProducts = await db.query.products.findMany({
      where: eq(products.isActive, true),
      columns: { slug: true, updatedAt: true },
    });

    const productPages: MetadataRoute.Sitemap = allProducts.map((p) => ({
      url: `${APP_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Category pages
    const allCategories = await db.query.categories.findMany({
      columns: { slug: true },
    });

    const categoryPages: MetadataRoute.Sitemap = allCategories.map((c) => ({
      url: `${APP_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch {
    return staticPages;
  }
}
