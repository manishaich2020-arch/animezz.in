import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of <span className="neon-text">Service</span></h1>
      <p className="text-slate-400 mb-10">Last updated: April 2026</p>
      <div className="space-y-8 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>By accessing OtakuVault (animezz.in), you agree to these terms. If you do not agree, please do not use our services.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Products & Orders</h2>
          <p>All products are subject to availability. We reserve the right to cancel orders if a product becomes unavailable after purchase. In such cases, a full refund will be issued.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Pricing</h2>
          <p>All prices are in Indian Rupees (₹) and inclusive of applicable taxes. We reserve the right to change prices at any time without notice.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Intellectual Property</h2>
          <p>All anime characters and related imagery are trademarks of their respective owners. OtakuVault sells officially licensed merchandise where applicable.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Contact</h2>
          <p>Questions? Email: <a href="mailto:support@animezz.in" className="text-[var(--accent)]">support@animezz.in</a></p>
        </section>
      </div>
    </div>
  );
}
