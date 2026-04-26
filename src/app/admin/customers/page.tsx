import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const customers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      orderCount: sql<number>`count(distinct ${orders.id})`,
      totalSpent: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end), 0)`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        <span className="neon-text">Customers</span>
      </h1>

      <div className="rounded-xl border border-white/5 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-[#111118] border-b border-white/5">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Orders</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Total Spent</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((c) => (
              <tr key={c.id} className="bg-[#0d0d14] hover:bg-[#111118] transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.role === "admin" ? "default" : "outline"}>{c.role}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-300">{Number(c.orderCount)}</td>
                <td className="px-4 py-3 font-medium text-[var(--accent)]">{formatPrice(Number(c.totalSpent))}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
