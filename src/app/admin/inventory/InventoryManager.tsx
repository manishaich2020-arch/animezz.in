"use client";

import { useState } from "react";
import { toast } from "@/components/ui/Toaster";
import { Save, AlertTriangle } from "lucide-react";

interface InventoryRow {
  id: string;
  sku: string | null;
  stock: number;
  reserved: number;
  productName: string;
  productSlug: string;
  updatedAt: Date;
}

export function InventoryManager({ initialRows }: { initialRows: InventoryRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleStockChange = (id: string, value: number) => {
    setEditing((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (row: InventoryRow) => {
    const newStock = editing[row.id];
    if (newStock === undefined) return;
    setSaving(row.id);
    try {
      const res = await fetch(`/api/admin/inventory/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, stock: newStock } : r));
        setEditing((prev) => { const n = { ...prev }; delete n[row.id]; return n; });
        toast.success(`Stock updated for ${row.productName}`);
      } else {
        toast.error("Failed to update stock");
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-[#111118] border-b border-white/5">
          <tr>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Product</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">SKU</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Stock</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Reserved</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Available</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => {
            const available = row.stock - row.reserved;
            const isLow = available <= 5;
            const currentVal = editing[row.id] ?? row.stock;
            const isDirty = editing[row.id] !== undefined;

            return (
              <tr key={row.id} className="bg-[#0d0d14] hover:bg-[#111118] transition-colors">
                <td className="px-4 py-3">
                  <a href={`/products/${row.productSlug}`} target="_blank" className="text-white hover:text-[var(--accent)] font-medium">
                    {row.productName}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{row.sku ?? "—"}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    value={currentVal}
                    onChange={(e) => handleStockChange(row.id, parseInt(e.target.value) || 0)}
                    className="w-20 bg-[#1a1a2e] border border-white/10 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </td>
                <td className="px-4 py-3 text-slate-400">{row.reserved}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium flex items-center gap-1 ${isLow ? "text-red-400" : "text-green-400"}`}>
                    {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                    {available}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isDirty && (
                    <button
                      onClick={() => handleSave(row)}
                      disabled={saving === row.id}
                      className="flex items-center gap-1 text-xs text-[var(--accent)] hover:brightness-110 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving === row.id ? "Saving..." : "Save"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
