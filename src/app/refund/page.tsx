import type { Metadata } from "next";
export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Refund <span className="neon-text">Policy</span></h1>
      <p className="text-slate-400 mb-10">Last updated: April 2026</p>
      <div className="space-y-8 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Returns & Refunds</h2>
          <p>We accept returns within <strong className="text-white">7 days</strong> of delivery for items that are:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Damaged or defective on arrival</li>
            <li>Incorrect item received</li>
            <li>Significantly different from the product description</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Non-Returnable Items</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Items damaged due to customer misuse</li>
            <li>Items without original packaging</li>
            <li>Digital products</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Refund Process</h2>
          <p>Once your return is received and inspected, we will process your refund within <strong className="text-white">5-7 business days</strong> to your original payment method.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">How to Initiate a Return</h2>
          <p>Email <a href="mailto:support@animezz.in" className="text-[var(--accent)]">support@animezz.in</a> with your order number and photos of the issue.</p>
        </section>
      </div>
    </div>
  );
}
