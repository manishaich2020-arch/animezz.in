"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { Save } from "lucide-react";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const statusVariant: Record<string, "success" | "warning" | "danger" | "default" | "outline"> = {
  confirmed: "success", delivered: "success",
  shipped: "default", processing: "default",
  pending: "warning",
  cancelled: "danger", refunded: "danger",
};

export function OrderStatusUpdater({
  orderId, currentStatus, currentPaymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (res.ok) {
        toast.success("Order updated!");
      } else {
        toast.error("Failed to update order");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "bg-[#0d0d14] border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]";

  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-[#111118]">
      <h2 className="font-semibold text-white mb-4">Update Status</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Order Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${selectClass} w-full`}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Payment Status</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={`${selectClass} w-full`}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} loading={loading}>
          <Save className="w-3.5 h-3.5" /> Save
        </Button>
        <div className="flex gap-2">
          <Badge variant={statusVariant[status] ?? "outline"}>{status}</Badge>
          <Badge variant={paymentStatus === "paid" ? "success" : "warning"}>{paymentStatus}</Badge>
        </div>
      </div>
    </div>
  );
}
