"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { Plus, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  minOrder: string | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons((prev) => [data.coupon, ...prev]);
        setAdding(false);
        setForm({ code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "" });
        toast.success("Coupon created!");
      } else {
        toast.error(data.error ?? "Failed to create coupon");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !isActive } : c));
      toast.success(isActive ? "Coupon deactivated" : "Coupon activated");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    }
  };

  const inputClass = "bg-[#0d0d14] border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4" /> New Coupon
        </Button>
      </div>

      {adding && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-white/10 bg-[#111118] space-y-4">
          <h3 className="font-semibold text-white">Create Coupon</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required className={`${inputClass} w-full`} placeholder="SAVE20" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`${inputClass} w-full`}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Value *</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className={`${inputClass} w-full`} placeholder={form.type === "percent" ? "10" : "100"} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Min Order (₹)</label>
              <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className={`${inputClass} w-full`} placeholder="300" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className={`${inputClass} w-full`} placeholder="Unlimited" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={`${inputClass} w-full`} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={loading}>Create</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#111118] border-b border-white/5">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Code</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Discount</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Min Order</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Used</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {coupons.map((c) => (
              <tr key={c.id} className="bg-[#0d0d14] hover:bg-[#111118] transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-[var(--accent)]">{c.code}</td>
                <td className="px-4 py-3 text-white">
                  {c.type === "percent" ? `${c.value}%` : `₹${c.value}`} off
                </td>
                <td className="px-4 py-3 text-slate-400">{c.minOrder ? `₹${c.minOrder}` : "—"}</td>
                <td className="px-4 py-3 text-slate-400">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.isActive ? "success" : "outline"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleToggle(c.id, c.isActive)} className="text-xs text-[var(--accent)] hover:brightness-110">
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
