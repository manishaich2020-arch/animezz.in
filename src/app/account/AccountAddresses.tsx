"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";

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

export function AccountAddresses({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [...prev, data.address]);
        setAdding(false);
        setForm({ name: "", line1: "", line2: "", city: "", state: "", pincode: "" });
        toast.success("Address added!");
      } else {
        toast.error(data.error ?? "Failed to add address");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success("Address removed");
      }
    } catch {
      toast.error("Failed to remove address");
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-[#111118]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--accent)]" /> Saved Addresses
        </h2>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {addresses.length === 0 && !adding && (
        <p className="text-sm text-slate-400">No addresses saved yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id} className="flex items-start justify-between p-3 rounded-xl bg-[#0d0d14] border border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{addr.name}</p>
                {addr.isDefault && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">Default</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
            <button onClick={() => handleDelete(addr.id)} className="text-slate-500 hover:text-red-400 transition-colors ml-3">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 p-4 rounded-xl border border-white/10 bg-[#0d0d14]">
          <p className="text-sm font-medium text-white">New Address</p>
          {[
            { key: "name", placeholder: "Full name", required: true },
            { key: "line1", placeholder: "Address line 1", required: true },
            { key: "line2", placeholder: "Address line 2 (optional)" },
            { key: "city", placeholder: "City", required: true },
            { key: "state", placeholder: "State", required: true },
            { key: "pincode", placeholder: "PIN code (6 digits)", required: true },
          ].map((f) => (
            <input
              key={f.key}
              type="text"
              placeholder={f.placeholder}
              required={f.required}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="search-input text-sm"
            />
          ))}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={loading}>
              <Check className="w-3.5 h-3.5" /> Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
