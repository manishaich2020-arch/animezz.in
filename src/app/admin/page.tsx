import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, products, users, reviews } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Package, ShoppingBag, Users, Star,
  TrendingUp, AlertTriangle, BarChart3
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    redirect("/");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Stats
  const [
    totalOrders,
    todayRevenue,
    totalProducts,
    totalUsers,
    pendingOrders,
    avgRating,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db
      .select({ sum: sql<number>`coalesce(sum(total), 0)` })
      .from(orders)
      .where(sql`created_at >= ${today} AND payment_status = 'paid'`),
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")),
    db.select({ avg: sql<number>`coalesce(avg(rating), 0)` }).from(reviews),
  ]);

  const stats = [
    {
      label: "Total Orders",
      value: Number(totalOrders[0]?.count ?? 0),
      icon: <ShoppingBag className="w-5 h-5" />,
      href: "/admin/orders",
      color: "#a855f7",
    },
    {
      label: "Today's Revenue",
      value: formatPrice(Number(todayRevenue[0]?.sum ?? 0)),
      icon: <TrendingUp className="w-5 h-5" />,
      href: "/admin/orders",
      color: "#22c55e",
    },
    {
      label: "Active Products",
      value: Number(totalProducts[0]?.count ?? 0),
      icon: <Package className="w-5 h-5" />,
      href: "/admin/products",
      color: "#06b6d4",
    },
    {
      label: "Total Customers",
      value: Number(totalUsers[0]?.count ?? 0),
      icon: <Users className="w-5 h-5" />,
      href: "/admin/customers",
      color: "#f59e0b",
    },
    {
      label: "Pending Orders",
      value: Number(pendingOrders[0]?.count ?? 0),
      icon: <AlertTriangle className="w-5 h-5" />,
      href: "/admin/orders?status=pending",
      color: "#ef4444",
    },
    {
      label: "Avg Rating",
      value: `${parseFloat(String(avgRating[0]?.avg ?? 0)).toFixed(1)} ★`,
      icon: <Star className="w-5 h-5" />,
      href: "/admin/reviews",
      color: "#f59e0b",
    },
  ];

  const adminLinks = [
    { href: "/admin/products", label: "Products", icon: <Package className="w-5 h-5" />, desc: "Manage product catalog" },
    { href: "/admin/categories", label: "Categories", icon: <BarChart3 className="w-5 h-5" />, desc: "Manage categories" },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingBag className="w-5 h-5" />, desc: "View & update orders" },
    { href: "/admin/inventory", label: "Inventory", icon: <BarChart3 className="w-5 h-5" />, desc: "Stock management" },
    { href: "/admin/customers", label: "Customers", icon: <Users className="w-5 h-5" />, desc: "User management" },
    { href: "/admin/reviews", label: "Reviews", icon: <Star className="w-5 h-5" />, desc: "Review moderation" },
    { href: "/admin/coupons", label: "Coupons", icon: <TrendingUp className="w-5 h-5" />, desc: "Discount codes" },
    { href: "/admin/settings", label: "Settings", icon: <AlertTriangle className="w-5 h-5" />, desc: "Site configuration" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Admin <span className="neon-text">Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-1">Welcome back, {session.user?.name}</p>
        </div>
        <Link href="/" className="text-sm text-[var(--accent)] hover:brightness-110">
          ← View Store
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-4 rounded-xl border border-white/5 bg-[#111118] hover:border-[var(--accent)]/30 transition-all group"
            style={{ "--accent": stat.color } as React.CSSProperties}
          >
            <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="p-5 rounded-xl border border-white/5 bg-[#111118] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all group"
          >
            <div className="text-[var(--accent)] mb-3 group-hover:scale-110 transition-transform inline-block">
              {link.icon}
            </div>
            <p className="font-semibold text-white text-sm">{link.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
