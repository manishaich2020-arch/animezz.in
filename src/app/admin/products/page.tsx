import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, categories, inventory } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      images: products.images,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      totalSold: products.totalSold,
      accentColor: products.accentColor,
      categoryName: categories.name,
      stock: sql<number>`coalesce(sum(${inventory.stock} - ${inventory.reserved}), 0)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .groupBy(products.id, categories.name)
    .orderBy(desc(products.createdAt));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">
          <span className="neon-text">Products</span>
        </h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#111118] border-b border-white/5">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Product</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Price</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Stock</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Sold</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((p) => (
              <tr key={p.id} className="bg-[#0d0d14] hover:bg-[#111118] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a2e] flex-shrink-0">
                      {p.images?.[0] ? (
                        p.images[0].startsWith("data:") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                        ) : (
                          <Image src={p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                        )
                      ) : (
                        <Package className="w-5 h-5 text-slate-600 m-auto mt-2.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white line-clamp-1">{p.name}</p>
                      {p.accentColor && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.accentColor }} />
                          <span className="text-[10px] text-slate-500">{p.accentColor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{p.categoryName ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-[var(--accent)]">{formatPrice(parseFloat(String(p.price)))}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={p.stock <= 5 ? "text-red-400" : "text-slate-300"}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{p.totalSold}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant={p.isActive ? "success" : "danger"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {p.isFeatured && <Badge>Featured</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center gap-1 text-xs text-[var(--accent)] hover:brightness-110"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
