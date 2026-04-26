"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Share2, Star, Shield, Truck, RotateCcw, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useCartStore } from "@/store/cart";
import { toast } from "@/components/ui/Toaster";
import { formatPrice, discountPercent } from "@/lib/utils";
import type { ProductCardData } from "@/components/products/ProductCard";

interface InventoryItem {
  id: string;
  sku: string | null;
  variant: Record<string, string> | null;
  stock: number;
  reserved: number;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  userName: string | null;
  userAvatar: string | null;
}

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    comparePrice: string | null;
    images: string[];
    accentColor: string | null;
    themeBg: string | null;
    minOrderQty: number;
    tags: string[];
    totalSold: number;
    inventory: InventoryItem[];
    category: { name: string; slug: string } | null;
  };
  reviews: Review[];
  avgRating: number;
  related: ProductCardData[];
}

export function ProductDetailClient({ product, reviews, avgRating, related }: ProductDetailClientProps) {
  const accent = product.accentColor ?? "#a855f7";
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const discount = comparePrice ? discountPercent(price, comparePrice) : 0;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(product.minOrderQty);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(
    product.inventory[0] ?? null
  );

  const addItem = useCartStore((s) => s.addItem);
  const availableStock = selectedInventory
    ? selectedInventory.stock - selectedInventory.reserved
    : 0;
  const inStock = availableStock > 0;

  // Apply per-product theme
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--glow", `${accent}20`);
    document.documentElement.style.setProperty("--breath-color", `${accent}40`);
    if (product.themeBg) {
      document.documentElement.style.setProperty("--bg", product.themeBg);
    }
    return () => {
      document.documentElement.style.setProperty("--accent", "#a855f7");
      document.documentElement.style.setProperty("--glow", "#a855f720");
      document.documentElement.style.setProperty("--breath-color", "#a855f740");
      document.documentElement.style.setProperty("--bg", "#0a0a0f");
    };
  }, [accent, product.themeBg]);

  const handleAddToCart = () => {
    if (!selectedInventory || !inStock) return;
    addItem({
      id: selectedInventory.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImg: product.images[0] ?? "",
      variant: selectedInventory.variant ?? {},
      price,
      quantity,
      stock: availableStock,
      accentColor: product.accentColor ?? undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard!");
    }
  };

  return (
    <div
      style={{ "--accent": accent, "--glow": `${accent}20`, "--breath-color": `${accent}40` } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <a href="/" className="hover:text-[var(--accent)]">Home</a>
          {" / "}
          {product.category && (
            <>
              <a href={`/category/${product.category.slug}`} className="hover:text-[var(--accent)]">
                {product.category.name}
              </a>
              {" / "}
            </>
          )}
          <span className="text-slate-300">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#111118] border border-white/5 breathe"
            >
              {product.images[selectedImage] ? (
                product.images[selectedImage].startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ShoppingCart className="w-20 h-20" />
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === i ? "border-[var(--accent)]" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    {img.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <Badge variant="outline">{product.category.name}</Badge>
              )}
              {discount > 0 && <Badge variant="danger">-{discount}% OFF</Badge>}
              {!inStock && <Badge variant="warning">Out of Stock</Badge>}
            </div>

            <h1 className="text-3xl font-bold text-white leading-tight">{product.name}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={avgRating} size="md" />
                <span className="text-sm text-slate-400">
                  {avgRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[var(--accent)]">{formatPrice(price)}</span>
              {comparePrice && (
                <span className="text-xl text-slate-500 line-through">{formatPrice(comparePrice)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-slate-400 leading-relaxed">{product.description}</p>
            )}

            {/* Variants */}
            {product.inventory.length > 1 && (
              <div>
                <p className="text-sm font-medium text-white mb-2">Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.inventory.map((inv) => {
                    const variantLabel = inv.variant
                      ? Object.values(inv.variant).join(" / ")
                      : inv.sku ?? "Default";
                    const available = inv.stock - inv.reserved;
                    return (
                      <button
                        key={inv.id}
                        onClick={() => setSelectedInventory(inv)}
                        disabled={available <= 0}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          selectedInventory?.id === inv.id
                            ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                            : available <= 0
                            ? "border-white/5 text-slate-600 cursor-not-allowed"
                            : "border-white/10 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {variantLabel}
                        {available <= 0 && " (OOS)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-white mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrderQty, quantity - 1))}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-300 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-300 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-500">
                  {inStock ? `${availableStock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 breathe"
              >
                <ShoppingCart className="w-5 h-5" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button size="lg" variant="outline" className="px-4">
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="ghost" className="px-4" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
              {[
                { icon: <Truck className="w-4 h-4" />, text: "Free shipping above ₹999" },
                { icon: <Shield className="w-4 h-4" />, text: "Secure payments" },
                { icon: <RotateCcw className="w-4 h-4" />, text: "Easy returns" },
              ].map((item) => (
                <div key={item.text} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[var(--accent)]">{item.icon}</span>
                  <span className="text-[10px] text-slate-400">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-2 py-1 rounded-full border border-white/10 text-slate-400 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-colors"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Customer <span className="neon-text">Reviews</span>
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 border border-white/5 rounded-2xl">
              <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 rounded-xl border border-white/5 bg-[#111118]">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">{review.userName ?? "Anonymous"}</span>
                        {review.isVerified && (
                          <Badge variant="success" className="text-[10px]">Verified Purchase</Badge>
                        )}
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  {review.title && <p className="font-medium text-slate-200 mb-1">{review.title}</p>}
                  {review.body && <p className="text-sm text-slate-400 leading-relaxed">{review.body}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              You May Also <span className="neon-text">Like</span>
            </h2>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>
    </div>
  );
}
