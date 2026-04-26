import { ProductCard, type ProductCardData } from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

interface ProductGridProps {
  products: ProductCardData[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  prioritizeFirst?: boolean; // Pass priority to first card for LCP optimization
}

export function ProductGrid({ products, loading, columns = 4, prioritizeFirst = false }: ProductGridProps) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[columns];

  if (loading) {
    return (
      <div className={`grid ${colClass} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-slate-400 text-lg">No products found</p>
        <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-4`}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={prioritizeFirst && i === 0} />
      ))}
    </div>
  );
}
