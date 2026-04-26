import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, orders, addresses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { User, MapPin, ShoppingBag, Heart, Settings, LogOut } from "lucide-react";
import { AccountAddresses } from "./AccountAddresses";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/account");

  const userId = (session.user as { id: string }).id;

  const [user, userAddresses, orderStats] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.addresses.findMany({ where: eq(addresses.userId, userId) }),
    db.select({ count: sql<number>`count(*)`, total: sql<number>`coalesce(sum(total),0)` })
      .from(orders)
      .where(eq(orders.userId, userId)),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">
        My <span className="neon-text">Account</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-2xl font-bold text-[var(--accent)]">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{user?.name}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
                {(session.user as { role?: string })?.role === "admin" && (
                  <span className="text-xs text-[var(--accent)] font-medium">Admin</span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div className="text-center p-3 rounded-xl bg-[#0d0d14]">
                <p className="text-2xl font-bold text-[var(--accent)]">{Number(orderStats[0]?.count ?? 0)}</p>
                <p className="text-xs text-slate-400">Orders</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#0d0d14]">
                <p className="text-lg font-bold text-[var(--accent)]">
                  ₹{Number(orderStats[0]?.total ?? 0).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-400">Spent</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1 pt-2 border-t border-white/5">
              {[
                { href: "/account/orders", icon: <ShoppingBag className="w-4 h-4" />, label: "My Orders" },
                { href: "/wishlist", icon: <Heart className="w-4 h-4" />, label: "Wishlist" },
                { href: "/account/addresses", icon: <MapPin className="w-4 h-4" />, label: "Addresses" },
                { href: "/account/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-[var(--accent)] hover:bg-white/5 transition-colors"
                >
                  <span className="text-[var(--accent)]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#111118]">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--accent)]" /> Profile Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Full Name</p>
                <p className="text-white font-medium">{user?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Phone</p>
                <p className="text-white font-medium">{user?.phone ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Member Since</p>
                <p className="text-white font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <AccountAddresses initialAddresses={userAddresses} />

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/account/orders" className="p-5 rounded-xl border border-white/10 bg-[#111118] hover:border-[var(--accent)]/40 transition-all group">
              <ShoppingBag className="w-6 h-6 text-[var(--accent)] mb-2" />
              <p className="font-semibold text-white">View Orders</p>
              <p className="text-xs text-slate-400 mt-0.5">Track your purchases</p>
            </Link>
            <Link href="/wishlist" className="p-5 rounded-xl border border-white/10 bg-[#111118] hover:border-[var(--accent)]/40 transition-all group">
              <Heart className="w-6 h-6 text-[var(--accent)] mb-2" />
              <p className="font-semibold text-white">Wishlist</p>
              <p className="text-xs text-slate-400 mt-0.5">Saved items</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
