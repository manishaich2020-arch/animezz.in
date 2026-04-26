import Link from "next/link";
import Image from "next/image";


export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[var(--accent)]/50 group-hover:border-[var(--accent)] transition-colors">
                <Image src="/logo.jpg" alt="Animezz Logo" fill className="object-cover" sizes="28px" />
              </div>
              <span className="font-bold text-lg neon-text tracking-tight">Animezz</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium anime merchandise delivered across India. Your one-stop vault for all things anime.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2">
              {[
                { href: "/products", label: "All Products" },
                { href: "/category/action-figures", label: "Action Figures" },
                { href: "/category/mouse-pads", label: "Mouse Pads" },
                { href: "/category/swords-prop-replicas", label: "Swords" },
                { href: "/category/mini-figures", label: "Mini Figures" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-[var(--accent)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2">
              {[
                { href: "/account", label: "My Account" },
                { href: "/account/orders", label: "Orders" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/cart", label: "Cart" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-[var(--accent)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/refund", label: "Refund Policy" },
                { href: "/shipping", label: "Shipping Policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-[var(--accent)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Animezz (animezz.in). All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Payments secured by PayU India 🔒
          </p>
        </div>
      </div>
    </footer>
  );
}
