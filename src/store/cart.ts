"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;           // inventory id
  productId: string;
  productName: string;
  productSlug: string;
  productImg: string;
  variant: Record<string, string>;
  price: number;
  quantity: number;
  stock: number;
  accentColor?: string;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;

  addItem: (item: CartItem) => void;
  removeItem: (inventoryId: string) => void;
  updateQuantity: (inventoryId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (inventoryId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== inventoryId),
        }));
      },

      updateQuantity: (inventoryId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(inventoryId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === inventoryId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      total: () => {
        const sub = get().subtotal();
        const discount = get().couponDiscount;
        const shipping = sub >= 999 ? 0 : 99;
        return Math.max(0, sub - discount + shipping);
      },
    }),
    {
      name: "otakuvault-cart",
    }
  )
);
