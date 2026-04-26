"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Search, Heart, User, Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { SearchBar } from "@/components/search/SearchBar";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { href: "/products", label: "All Products" },
  { href: "/category/action-figures", label: "Figures" },
  { href: "/category/mouse-pads", label: "Mouse Pads" },
  { href: "/category/swords-prop-replicas", label: "Swords" },
];

export function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--accent)]/50 group-hover:border-[var(--accent)] transition-colors shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]">
              <Image src="/logo.jpg" alt="Animezz Logo" fill className="object-cover" sizes="32px" />
            </div>
            <span className="font-bold text-xl neon-text tracking-tight">Animezz</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-[var(--accent)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-[var(--accent)] transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-400 hover:text-[var(--accent)] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            {session && (
              <Link
                href="/wishlist"
                className="p-2 text-slate-400 hover:text-[var(--accent)] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart — suppressHydrationWarning on badge span prevents server/client mismatch */}
            <Link
              href="/cart"
              className="relative p-2 text-slate-400 hover:text-[var(--accent)] transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span suppressHydrationWarning className="absolute -top-0.5 -right-0.5">
                {totalItems > 0 && (
                  <span className="bg-[var(--accent)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </span>
            </Link>

            {/* User dropdown */}
            {session ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 p-2 text-slate-400 hover:text-[var(--accent)] transition-colors"
                  aria-label={`Account menu for ${session.user?.name ?? "user"}`}
                >
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-[#111118] border border-white/15 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl shadow-black/60 z-50">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                  </div>
                  <Link href="/account" className="block px-4 py-2.5 text-sm text-slate-200 hover:text-[var(--accent)] hover:bg-white/5 transition-colors">
                    My Account
                  </Link>
                  <Link href="/account/orders" className="block px-4 py-2.5 text-sm text-slate-200 hover:text-[var(--accent)] hover:bg-white/5 transition-colors">
                    Orders
                  </Link>
                  <Link href="/wishlist" className="block px-4 py-2.5 text-sm text-slate-200 hover:text-[var(--accent)] hover:bg-white/5 transition-colors">
                    Wishlist
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block px-4 py-2.5 text-sm text-[var(--accent)] font-medium hover:bg-white/5 transition-colors border-t border-white/10 mt-1 pt-2.5">
                      ⚡ Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors border-t border-white/10 mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-[var(--accent)] hover:brightness-110 transition-all px-3 py-1.5 border border-[var(--accent)]/40 rounded-lg hover:bg-[var(--glow)]"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar (expandable) */}
        {searchOpen && (
          <div className="pb-3">
            <SearchBar onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        )}

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2 text-sm text-slate-300 hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
