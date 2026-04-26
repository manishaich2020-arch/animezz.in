"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { ProductCardData } from "@/components/products/ProductCard";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductsPageClientProps {
  categories: Category[];
  searchParams: { [key: string]: string | undefined };
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "bestseller", label: "Best Sellers" },
];

export function ProductsPageClient({ categories }: ProductsPageClientProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const category = sp.get("category") ?? "";
  const sort = sp.get("sort") ?? "relevance";
  const minPrice = sp.get("minPrice") ?? "0";
  const maxPrice = sp.get("maxPrice") ?? "999999";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: "",
        category,
        sort,
        minPrice,
        maxPrice,
        page: String(page),
      });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setProducts(data.results ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [category, sort, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar Filters */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>

            {/* Categories */}
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Category</p>
              <button
                onClick={() => updateParam("category", "")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  !category ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.slug)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    category === cat.slug ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <p className="text-sm text-slate-400">
            {loading ? "Loading..." : `${total} products`}
          </p>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none bg-[#111118] border border-white/10 text-slate-300 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <ProductGrid products={products} loading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                  page === i + 1
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[#111118] text-slate-400 hover:text-white border border-white/10"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
