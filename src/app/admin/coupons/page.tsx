import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CouponManager } from "./CouponManager";

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const allCoupons = await db.query.coupons.findMany({ orderBy: (c, { desc }) => [desc(c.id)] });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        <span className="neon-text">Coupons</span>
      </h1>
      <CouponManager initialCoupons={allCoupons.map(c => ({
        ...c,
        value: String(c.value),
        minOrder: c.minOrder ? String(c.minOrder) : null,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      }))} />
    </div>
  );
}
