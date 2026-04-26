import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, categories, inventory, reviews, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { ProductDetailClient } from "./ProductDetailClient";

// Revalidate product pages every 10 minutes
export const revalidate = 600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://animezz.in";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, params.slug),
  });
  if (!product) return { title: "Product Not Found" };

  const imageUrl = product.images?.[0] ? `${APP_URL}${product.images[0]}` : undefined;

  return {
    title: `${product.name} — Buy Online India`,
    description: product.description
      ? `${product.description.slice(0, 155)}...`
      : `Buy ${product.name} online in India. Fast shipping, authentic merchandise.`,
    openGraph: {
      title: product.name,
      description: product.description ?? `Buy ${product.name} online`,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${APP_URL}/products/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, params.slug), eq(products.isActive, true)),
    with: {
      category: true,
      inventory: true,
    },
  });

  if (!product) notFound();

  // Get reviews with user info
  const productReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      images: reviews.images,
      isVerified: reviews.isVerified,
      helpful: reviews.helpful,
      createdAt: reviews.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)))
    .orderBy(sql`${reviews.createdAt} DESC`)
    .limit(20);

  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
      : 0;

  // Related products
  const related = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      comparePrice: products.comparePrice,
      images: products.images,
      accentColor: products.accentColor,
      isFeatured: products.isFeatured,
      totalSold: products.totalSold,
      categoryName: categories.name,
      inventoryId: inventory.id,
      availableStock: sql<number>`(${inventory.stock} - ${inventory.reserved})`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(
      and(
        eq(products.categoryId, product.categoryId!),
        eq(products.isActive, true),
        sql`${products.id} != ${product.id}`
      )
    )
    .limit(4);

  const price = parseFloat(String(product.price));
  const availability = product.inventory.some(i => i.stock - i.reserved > 0)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: (product.images ?? []).map(img => img.startsWith("http") ? img : `${APP_URL}${img}`),
    sku: product.id,
    brand: { "@type": "Brand", name: "OtakuVault" },
    offers: {
      "@type": "Offer",
      url: `${APP_URL}/products/${product.slug}`,
      priceCurrency: "INR",
      price: price.toFixed(2),
      availability,
      seller: { "@type": "Organization", name: "OtakuVault" },
    },
    ...(avgRating > 0 && productReviews.length > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: productReviews.length,
        bestRating: "5",
        worstRating: "1",
      },
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient
        product={{
          ...product,
          price: String(product.price),
          comparePrice: product.comparePrice ? String(product.comparePrice) : null,
          images: product.images ?? [],
          tags: product.tags ?? [],
        }}
        reviews={productReviews.map(r => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          images: r.images ?? [],
        }))}
        avgRating={avgRating}
        related={related.map(r => ({
          ...r,
          price: String(r.price),
          comparePrice: r.comparePrice ? String(r.comparePrice) : null,
          categoryName: r.categoryName ?? undefined,
          inventoryId: r.inventoryId ?? undefined,
        }))}
      />
    </>
  );
}
