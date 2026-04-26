import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { inventory, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { InventoryManager } from "./InventoryManager";

export default async function AdminInventoryPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const rows = await db
    .select({
      id: inventory.id,
      sku: inventory.sku,
      stock: inventory.stock,
      reserved: inventory.reserved,
      variant: inventory.variant,
      updatedAt: inventory.updatedAt,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .orderBy(sql`${inventory.stock} ASC`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        <span className="neon-text">Inventory</span> Management
      </h1>
      <InventoryManager initialRows={rows} />
    </div>
  );
}
