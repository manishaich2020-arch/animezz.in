"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatPrice, discountPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store/cart";
import { toast } from "@/components/ui/Toaster";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: string;
  comparePrice?: string | null;
  images: string[];
  accentColor?: string | null;
  isFeatured?: boolean;
  totalSold?: number;
  avgRating?: number;
  reviewCount?: number;
  availableStock?: number | null;
  categoryName?: string | null;
  inventoryId?: string | null;
}

interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean; // Set true for above-fold LCP images
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const accent = product.accentColor ?? "var(--accent)";
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const discount = comparePrice ? discountPercent(price, comparePrice) : 0;
  const inStock = (product.availableStock ?? 1) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inventoryId) {
      toast.error("Please select a variant on the product page");
      return;
    }
    addItem({
      id: product.inventoryId,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImg: product.images[0] ?? "",
      variant: {},
      price,
      quantity: 1,
      stock: product.availableStock ?? 10,
      accentColor: product.accentColor ?? undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div
      className="product-card group"
      style={{ "--accent": accent, "--glow": `${accent}20`, "--breath-color": `${accent}40` } as React.CSSProperties}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#111]">
          {product.images[0] ? (
            product.images[0].startsWith("data:") ? (
              // Base64 image — use regular img tag
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge variant="danger" className="text-[10px]">-{discount}%</Badge>
            )}
            {product.isFeatured && (
              <Badge className="text-[10px]">Featured</Badge>
            )}
            {!inStock && (
              <Badge variant="warning" className="text-[10px]">Out of Stock</Badge>
            )}
          </div>

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="p-2.5 rounded-full bg-[var(--accent)] text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.categoryName && (
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              {product.categoryName}
            </p>
          )}
          <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avgRating !== undefined && product.reviewCount !== undefined && product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-slate-400">
                {product.avgRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--accent)]">{formatPrice(price)}</span>
            {comparePrice && (
              <span className="text-xs text-slate-500 line-through">{formatPrice(comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
