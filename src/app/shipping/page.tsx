import type { Metadata } from "next";
export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Shipping <span className="neon-text">Policy</span></h1>
      <p className="text-slate-400 mb-10">Last updated: April 2026</p>
      <div className="space-y-8 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Delivery Timeframes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
              <thead className="bg-[#111118]">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-300">Location</th>
                  <th className="text-left px-4 py-3 text-slate-300">Estimated Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="bg-[#0d0d14]"><td className="px-4 py-3">Metro Cities</td><td className="px-4 py-3">2-3 business days</td></tr>
                <tr className="bg-[#0d0d14]"><td className="px-4 py-3">Tier 2 Cities</td><td className="px-4 py-3">3-5 business days</td></tr>
                <tr className="bg-[#0d0d14]"><td className="px-4 py-3">Remote Areas</td><td className="px-4 py-3">5-7 business days</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Shipping Charges</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-white">Free shipping</strong> on orders above ₹999</li>
            <li>Flat ₹99 shipping fee for orders below ₹999</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Order Tracking</h2>
          <p>Once your order is shipped, you will receive a tracking number via email. You can track your order from your account dashboard.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
          <p>Shipping queries: <a href="mailto:support@animezz.in" className="text-[var(--accent)]">support@animezz.in</a></p>
        </section>
      </div>
    </div>
  );
}
