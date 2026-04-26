"use client";

import { useState } from "react";
import { toast } from "@/components/ui/Toaster";
import { Check, Loader2 } from "lucide-react";

const ORDER_STATUSES = [
  { value: "pending",    label: "Pending",    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  { value: "confirmed",  label: "Confirmed",  color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { value: "processing", label: "Processing", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  { value: "shipped",    label: "Shipped",    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
  { value: "delivered",  label: "Delivered",  color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  { value: "cancelled",  label: "Cancelled",  color: "text-red-400 bg-red-400/10 border-red-400/30" },
  { value: "refunded",   label: "Refunded",   color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
];

const PAYMENT_STATUSES = [
  { value: "pending",  label: "Pending",  color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  { value: "paid",     label: "Paid",     color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { value: "failed",   label: "Failed",   color: "text-red-400 bg-red-400/10 border-red-400/30" },
  { value: "refunded", label: "Refunded", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
];

interface Props {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

export function OrderStatusManager({ orderId, currentStatus, currentPaymentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = status !== currentStatus || paymentStatus !== currentPaymentStatus;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        toast.success("Order status updated!");
      } else {
        toast.error("Failed to update order");
      }
    } finally {
      setSaving(false);
    }
  };

  const currentOrderStatus = ORDER_STATUSES.find((s) => s.value === status);
  const currentPayStatus = PAYMENT_STATUSES.find((s) => s.value === paymentStatus);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Order Status Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 whitespace-nowrap">Order:</span>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)] bg-[#0d0d14] transition-colors ${currentOrderStatus?.color ?? "text-slate-300 bg-white/5 border-white/10"}`}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#111118] text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Payment Status Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 whitespace-nowrap">Payment:</span>
        <div className="relative">
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)] bg-[#0d0d14] transition-colors ${currentPayStatus?.color ?? "text-slate-300 bg-white/5 border-white/10"}`}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#111118] text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Save button — only shows when changed */}
      {isDirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--accent)] text-white hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          {saving ? "Saving..." : "Save"}
        </button>
      )}

      {/* Saved confirmation */}
      {saved && !isDirty && (
        <span className="text-xs text-green-400 flex items-center gap-1">
          <Check className="w-3 h-3" /> Saved
        </span>
      )}
    </div>
  );
}
