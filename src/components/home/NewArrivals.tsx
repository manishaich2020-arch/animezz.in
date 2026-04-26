import { db } from "@/lib/db";
import { products, categories, inventory } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ProductGrid } from "@/components/products/ProductGrid";

async function getNewArrivalRows() {
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
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(8);
}

export async function NewArrivals() {
  let rows: Awaited<ReturnType<typeof getNewArrivalRows>> = [];

  try {
    rows = await getNewArrivalRows();
  } catch (error) {
    console.error("[home:new-arrivals] failed to load new arrivals", error);
  }

  return <ProductGrid products={rows.map(r => ({ ...r, price: String(r.price), comparePrice: r.comparePrice ? String(r.comparePrice) : null }))} />;
}
