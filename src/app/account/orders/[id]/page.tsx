import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Package, MapPin, CreditCard, ArrowLeft } from "lucide-react";
import { InvoiceDownload } from "./InvoiceDownload";

const statusVariant: Record<string, "success" | "warning" | "danger" | "default" | "outline"> = {
  confirmed: "success", delivered: "success",
  shipped: "default", processing: "default",
  pending: "warning",
  cancelled: "danger", refunded: "danger",
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, params.id), eq(orders.userId, userId)),
    with: { items: true, address: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account/orders" className="text-slate-400 hover:text-[var(--accent)] text-sm flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Orders
        </Link>
        <span className="text-slate-600">/</span>
        <h1 className="text-xl font-bold text-white">{order.orderNumber}</h1>
      </div>

      <div className="space-y-5">
        {/* Status */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#111118]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-slate-400">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={statusVariant[order.status] ?? "outline"}>{order.status}</Badge>
              <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#111118]">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-[var(--accent)]" /> Order Items
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{item.productName}</p>
                  {item.variant && Object.keys(item.variant as object).length > 0 && (
                    <p className="text-xs text-slate-400">{Object.entries(item.variant as Record<string,string>).map(([k,v])=>`${k}: ${v}`).join(", ")}</p>
                  )}
                  <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatPrice(parseFloat(String(item.unitPrice)))}</p>
                </div>
                <p className="font-semibold text-[var(--accent)]">{formatPrice(parseFloat(String(item.totalPrice)))}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span><span>{formatPrice(parseFloat(String(order.subtotal ?? 0)))}</span>
            </div>
            {parseFloat(String(order.discount ?? 0)) > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span><span>-{formatPrice(parseFloat(String(order.discount)))}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span><span>{parseFloat(String(order.shippingFee ?? 0)) === 0 ? <span className="text-green-400">FREE</span> : formatPrice(parseFloat(String(order.shippingFee)))}</span>
            </div>
            <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/5">
              <span>Total</span><span className="text-[var(--accent)]">{formatPrice(parseFloat(String(order.total ?? 0)))}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div className="p-5 rounded-2xl border border-white/10 bg-[#111118]">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--accent)]" /> Delivery Address
            </h2>
            <p className="text-sm font-medium text-white">{order.address.name}</p>
            <p className="text-sm text-slate-400">
              {[order.address.line1, order.address.line2, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        {/* Payment */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#111118]">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[var(--accent)]" /> Payment
          </h2>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Method</span>
              <span className="text-white">{order.paymentMode ?? "—"}</span>
            </div>
            {order.payuTxnId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID</span>
                <span className="text-white font-mono text-xs">{order.payuTxnId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Download */}
        <InvoiceDownload order={order} />
      </div>
    </div>
  );
}
