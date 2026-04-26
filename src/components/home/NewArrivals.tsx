import { db } from "@/lib/db";
import { products, categories, inventory } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ProductGrid } from "@/components/products/ProductGrid";

export async function NewArrivals() {
  const rows = await db
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

  return <ProductGrid products={rows.map(r => ({ ...r, price: String(r.price), comparePrice: r.comparePrice ? String(r.comparePrice) : null }))} />;
}
