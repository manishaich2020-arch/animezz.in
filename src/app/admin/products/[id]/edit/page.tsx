import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import { ProductForm } from "../../ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const [product, cats] = await Promise.all([
    db.query.products.findFirst({
      where: eq(products.id, params.id),
      with: { inventory: true },
    }),
    db.query.categories.findMany({ where: isNull(categories.parentId) }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <a href="/admin/products" className="text-slate-400 hover:text-[var(--accent)] text-sm">← Products</a>
        <span className="text-slate-600">/</span>
        <h1 className="text-2xl font-bold text-white">Edit <span className="neon-text">Product</span></h1>
      </div>
      <ProductForm
        categories={cats}
        product={{
          ...product,
          price: String(product.price),
          comparePrice: product.comparePrice ? String(product.comparePrice) : "",
          images: product.images ?? [],
          tags: product.tags ?? [],
          accentColor: product.accentColor ?? "",
          themeBg: product.themeBg ?? "",
          stock: product.inventory[0]?.stock ?? 0,
          inventoryId: product.inventory[0]?.id,
        }}
      />
    </div>
  );
}
