import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Orders" };

const statusVariant: Record<string, "success" | "warning" | "danger" | "default" | "outline"> = {
  confirmed: "success", delivered: "success",
  shipped: "default", processing: "default",
  pending: "warning",
  cancelled: "danger", refunded: "danger",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/account/orders");

  const userId = (session.user as { id: string }).id;

  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account" className="text-slate-400 hover:text-[var(--accent)] text-sm">← Account</Link>
        <span className="text-slate-600">/</span>
        <h1 className="text-2xl font-bold text-white">My <span className="neon-text">Orders</span></h1>
      </div>

      {userOrders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No orders yet</p>
          <p className="text-slate-500 text-sm mt-2 mb-6">Start shopping to see your orders here</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:brightness-110">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <div key={order.id} className="p-5 rounded-2xl border border-white/10 bg-[#111118]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold text-white">{order.orderNumber}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge variant={statusVariant[order.status] ?? "outline"}>{order.status}</Badge>
                  <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-300 flex-1 truncate">{item.productName} × {item.quantity}</span>
                    <span className="text-white font-medium">{formatPrice(parseFloat(String(item.totalPrice)))}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="text-sm">
                  <span className="text-slate-400">Total: </span>
                  <span className="font-bold text-[var(--accent)]">{formatPrice(parseFloat(String(order.total ?? 0)))}</span>
                  {order.paymentMode && <span className="text-slate-500 ml-2">via {order.paymentMode}</span>}
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-xs text-[var(--accent)] hover:brightness-110 flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
