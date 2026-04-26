import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { wishlists, products, categories, inventory } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/wishlist");

  const userId = (session.user as { id: string }).id;

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
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(eq(wishlists.userId, userId));

  const productList = rows.map((r) => ({
    ...r,
    price: String(r.price),
    comparePrice: r.comparePrice ? String(r.comparePrice) : null,
    categoryName: r.categoryName ?? undefined,
    inventoryId: r.inventoryId ?? undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">
        My <span className="neon-text">Wishlist</span>
      </h1>
      <p className="text-slate-400 mb-8">{productList.length} saved items</p>

      {productList.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Your wishlist is empty</p>
          <p className="text-slate-500 text-sm mt-2 mb-6">Save products you love to find them later</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:brightness-110">
            Browse Products
          </Link>
        </div>
      ) : (
        <ProductGrid products={productList} />
      )}
    </div>
  );
}
