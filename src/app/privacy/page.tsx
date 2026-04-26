import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy <span className="neon-text">Policy</span></h1>
      <p className="text-slate-400 mb-10">Last updated: April 2026</p>
      <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email address, phone number, and delivery addresses when you create an account or place an order. We also collect payment transaction IDs from PayU (we never store card details).</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Respond to customer support requests</li>
            <li>Send promotional emails (you can unsubscribe anytime)</li>
            <li>Improve our website and services</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
          <p>We use industry-standard encryption (HTTPS) for all data transmission. Passwords are hashed using bcrypt. Payment processing is handled by PayU India — we never see or store your card details.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
          <p>We use essential cookies for authentication sessions and cart persistence. We do not use third-party tracking cookies.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Contact</h2>
          <p>For privacy concerns, email us at: <a href="mailto:support@animezz.in" className="text-[var(--accent)]">support@animezz.in</a></p>
        </section>
      </div>
    </div>
  );
}
