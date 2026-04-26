import { Suspense } from "react";
import { ProductsPageClient } from "./ProductsPageClient";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our full collection of anime merchandise",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const cats = await db.query.categories.findMany({
    where: isNull(categories.parentId),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">
        All <span className="neon-text">Products</span>
      </h1>
      <p className="text-slate-400 mb-8">Discover our full collection of anime merchandise</p>

      <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
        <ProductsPageClient categories={cats} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
