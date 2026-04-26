import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { OrderStatusManager } from "./OrderStatusManager";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const allOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
      paymentMode: orders.paymentMode,
      createdAt: orders.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        <span className="neon-text">Orders</span>
        <span className="text-slate-400 text-base font-normal ml-3">{allOrders.length} total</span>
      </h1>

      {allOrders.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {allOrders.map((order) => (
            <div key={order.id} className="p-4 rounded-xl border border-white/5 bg-[#111118]">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                {/* Order info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-bold text-[var(--accent)] hover:brightness-110 text-sm"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-white mt-0.5">{order.userName ?? "Guest"}</p>
                  <p className="text-xs text-slate-400">{order.userEmail}</p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-bold text-white text-lg">
                    {formatPrice(parseFloat(String(order.total ?? 0)))}
                  </p>
                  {order.paymentMode && (
                    <p className="text-xs text-slate-500">{order.paymentMode}</p>
                  )}
                </div>
              </div>

              {/* Status manager row */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <OrderStatusManager
                  orderId={order.id}
                  currentStatus={order.status}
                  currentPaymentStatus={order.paymentStatus}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
