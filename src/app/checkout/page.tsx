"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { MapPin, Plus, CreditCard } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { SHIPPING_FEE, FREE_SHIPPING_ABOVE } from "@/lib/constants";

interface Address {
  id: string;
  name: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, subtotal, couponCode, couponDiscount, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });

  const sub = subtotal();
  const shipping = sub >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const discount = couponDiscount;
  const total = Math.max(0, sub - discount + shipping);

  useEffect(() => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      setAddresses(data.addresses ?? []);
      const def = data.addresses?.find((a: Address) => a.isDefault);
      if (def) setSelectedAddress(def.id);
    } catch {
      // ignore
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [...prev, data.address]);
        setSelectedAddress(data.address.id);
        setAddingAddress(false);
        setNewAddress({ name: "", line1: "", line2: "", city: "", state: "", pincode: "" });
        toast.success("Address added!");
      }
    } catch {
      toast.error("Failed to add address");
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            inventoryId: i.id,
            productId: i.productId,
            productName: i.productName,
            productImg: i.productImg,
            variant: i.variant,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          addressId: selectedAddress,
          couponCode: couponCode ?? undefined,
          couponDiscount: discount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Payment initiation failed");
        return;
      }

      // Create and submit PayU form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.payuUrl;

      Object.entries(data.payuParams).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      clearCart();
      form.submit();
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">
        <span className="neon-text">Checkout</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Address */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--accent)]" /> Delivery Address
          </h2>

          <div className="space-y-3 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAddress === addr.id
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-white/10 bg-[#111118] hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={() => setSelectedAddress(addr.id)}
                  className="mt-1 accent-[var(--accent)]"
                />
                <div>
                  <p className="font-medium text-white text-sm">{addr.name}</p>
                  <p className="text-sm text-slate-400">
                    {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {!addingAddress ? (
            <button
              onClick={() => setAddingAddress(true)}
              className="flex items-center gap-2 text-sm text-[var(--accent)] hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" /> Add new address
            </button>
          ) : (
            <form onSubmit={handleAddAddress} className="space-y-3 p-4 rounded-xl border border-white/10 bg-[#111118]">
              <h3 className="text-sm font-medium text-white">New Address</h3>
              {[
                { key: "name", placeholder: "Full name", required: true },
                { key: "line1", placeholder: "Address line 1", required: true },
                { key: "line2", placeholder: "Address line 2 (optional)" },
                { key: "city", placeholder: "City", required: true },
                { key: "state", placeholder: "State", required: true },
                { key: "pincode", placeholder: "PIN code", required: true },
              ].map((field) => (
                <input
                  key={field.key}
                  type="text"
                  placeholder={field.placeholder}
                  required={field.required}
                  value={newAddress[field.key as keyof typeof newAddress]}
                  onChange={(e) => setNewAddress({ ...newAddress, [field.key]: e.target.value })}
                  className="search-input text-sm"
                />
              ))}
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Address</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setAddingAddress(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

          <div className="p-5 rounded-xl border border-white/10 bg-[#111118] space-y-4">
            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-300 flex-1 truncate pr-4">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-white font-medium flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="text-[var(--accent)]">{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full breathe"
              onClick={handlePayment}
              loading={loading}
              disabled={!selectedAddress}
            >
              <CreditCard className="w-5 h-5" />
              Pay {formatPrice(total)} via PayU
            </Button>

            <p className="text-xs text-center text-slate-500">
              🔒 Secured by PayU India. Your payment info is never stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
