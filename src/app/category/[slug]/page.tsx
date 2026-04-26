import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { categories, products, inventory } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await db.query.categories.findFirst({
    where: eq(categories.slug, params.slug),
  });
  if (!cat) return { title: "Category Not Found" };
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://animezz.in";
  return {
    title: `${cat.name} — Buy Online India`,
    description: `Shop ${cat.name} anime merchandise online in India. Authentic collectibles, fast shipping.`,
    alternates: { canonical: `${APP_URL}/category/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, params.slug),
  });

  if (!category) notFound();

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
    .where(and(eq(products.categoryId, category.id), eq(products.isActive, true)))
    .orderBy(sql`${products.totalSold} DESC`);

  const productList = rows.map((r) => ({
    ...r,
    price: String(r.price),
    comparePrice: r.comparePrice ? String(r.comparePrice) : null,
    categoryName: r.categoryName ?? undefined,
    inventoryId: r.inventoryId ?? undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-slate-500 mb-6">
        <a href="/" className="hover:text-[var(--accent)]">Home</a>
        {" / "}
        <span className="text-slate-300">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-2">
        <span className="neon-text">{category.name}</span>
      </h1>
      <p className="text-slate-400 mb-8">{productList.length} products</p>

      <ProductGrid products={productList} prioritizeFirst />
    </div>
  );
}
