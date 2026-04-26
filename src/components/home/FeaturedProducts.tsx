import { db } from "@/lib/db";
import { products, categories, inventory } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { ProductGrid } from "@/components/products/ProductGrid";

async function getFeaturedProductRows() {
  return db
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
    .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
    .limit(8);
}

export async function FeaturedProducts() {
  let rows: Awaited<ReturnType<typeof getFeaturedProductRows>> = [];

  try {
    rows = await getFeaturedProductRows();
  } catch (error) {
    console.error("[home:featured-products] failed to load featured products", error);
  }

  return <ProductGrid products={rows.map(r => ({ ...r, price: String(r.price), comparePrice: r.comparePrice ? String(r.comparePrice) : null }))} prioritizeFirst />;
}
