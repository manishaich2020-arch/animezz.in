import Link from "next/link";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OrderFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">Payment Failed 😔</h1>
        <p className="text-slate-400 mb-8">
          Something went wrong with your payment. Don&apos;t worry — no money was deducted.
          Your cart items are still available.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/cart">
            <Button>
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
