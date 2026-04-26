import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, params.id),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 breathe">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">Order Confirmed! 🎌</h1>
        <p className="text-slate-400 mb-2">
          Your anime merchandise is on its way!
        </p>
        {order && (
          <p className="text-sm text-[var(--accent)] font-medium mb-8">
            Order #{order.orderNumber}
          </p>
        )}

        <div className="p-5 rounded-xl border border-white/10 bg-[#111118] mb-8 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Package className="w-4 h-4 text-[var(--accent)]" />
            <span>You&apos;ll receive a confirmation email shortly</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
            <span>Estimated delivery: 2-5 business days</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/account/orders">
            <Button variant="outline">Track Order</Button>
          </Link>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
