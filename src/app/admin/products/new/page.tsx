import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const cats = await db.query.categories.findMany({ where: isNull(categories.parentId) });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <a href="/admin/products" className="text-slate-400 hover:text-[var(--accent)] text-sm">← Products</a>
        <span className="text-slate-600">/</span>
        <h1 className="text-2xl font-bold text-white">Add <span className="neon-text">Product</span></h1>
      </div>
      <ProductForm categories={cats} />
    </div>
  );
}
