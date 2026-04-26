"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { ProductCardData } from "@/components/products/ProductCard";
import { SearchBar } from "@/components/search/SearchBar";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "bestseller", label: "Best Sellers" },
];

function SearchContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "relevance";

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async () => {
    if (!q) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setProducts(data.results ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [q, sort]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const updateSort = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("sort", value);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search bar */}
      <div className="max-w-2xl mb-8">
        <SearchBar />
      </div>

      {q && (
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Results for <span className="neon-text">&quot;{q}&quot;</span>
            </h1>
            {!loading && (
              <p className="text-sm text-slate-400 mt-1">{total} products found</p>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => updateSort(o.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    sort === o.value
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[#111118] text-slate-400 hover:text-white border border-white/10"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!q && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-slate-400 text-lg">Search for anime merchandise</p>
          <p className="text-slate-500 text-sm mt-2">Try &quot;Goku&quot;, &quot;mouse pad&quot;, &quot;katana&quot;...</p>
        </div>
      )}

      {q && <ProductGrid products={products} loading={loading} />}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
