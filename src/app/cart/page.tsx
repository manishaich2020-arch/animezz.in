"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/Toaster";
import { MIN_ORDER_THRESHOLD, SHIPPING_FEE, FREE_SHIPPING_ABOVE } from "@/lib/constants";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, total, couponCode, couponDiscount, applyCoupon, removeCoupon } =
    useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  // Prevent hydration mismatch — Zustand persist reads from localStorage only on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sub = subtotal();
  const totalAmount = total();
  const shipping = sub >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const progress = Math.min((sub / MIN_ORDER_THRESHOLD) * 100, 100);
  const remaining = Math.max(0, MIN_ORDER_THRESHOLD - sub);
  const canCheckout = sub >= MIN_ORDER_THRESHOLD;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), orderTotal: sub }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon(data.code, data.discount);
        toast.success(`Coupon applied! You saved ${formatPrice(data.discount)}`);
        setCouponInput("");
      } else {
        toast.error(data.error ?? "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Show skeleton until client hydrates
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Your <span className="neon-text">Cart</span></h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-slate-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-3">Your cart is empty</h1>
        <p className="text-slate-400 mb-8">Add some anime merchandise to get started!</p>
        <Link href="/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">
        Your <span className="neon-text">Cart</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-xl border border-white/5 bg-[#111118]"
              style={{ "--accent": item.accentColor ?? "#a855f7" } as React.CSSProperties}
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a2e]">
                {item.productImg && (
                  <Image src={item.productImg} alt={item.productName} fill className="object-cover" sizes="80px" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="font-medium text-white hover:text-[var(--accent)] transition-colors line-clamp-2 text-sm"
                >
                  {item.productName}
                </Link>
                {Object.keys(item.variant).length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </p>
                )}
                <p className="text-[var(--accent)] font-bold mt-1">{formatPrice(item.price)}</p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-300 hover:border-[var(--accent)] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-300 hover:border-[var(--accent)] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-sm font-semibold text-white">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Minimum order progress */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#111118]">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Minimum order progress</span>
              <span className={canCheckout ? "text-green-400" : "text-[var(--accent)]"}>
                {formatPrice(sub)} / {formatPrice(MIN_ORDER_THRESHOLD)}
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            {!canCheckout && (
              <p className="text-xs text-slate-400 mt-2">
                Add {formatPrice(remaining)} more to unlock checkout
              </p>
            )}
            {canCheckout && (
              <p className="text-xs text-green-400 mt-2">✓ Minimum order reached!</p>
            )}
          </div>

          {/* Coupon */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#111118]">
            <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--accent)]" /> Coupon Code
            </p>
            {couponCode ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400 font-medium">{couponCode} applied!</span>
                <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-300">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  id="coupon-input"
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="search-input flex-1 text-sm py-2"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                />
                <Button size="sm" onClick={handleApplyCoupon} loading={couponLoading}>
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#111118] space-y-3">
            <h3 className="font-semibold text-white">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="text-[var(--accent)]">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full" disabled={!canCheckout}>
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            {!canCheckout && (
              <p className="text-xs text-center text-slate-500">
                Minimum order of {formatPrice(MIN_ORDER_THRESHOLD)} required
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
