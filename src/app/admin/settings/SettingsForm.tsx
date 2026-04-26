"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { Save, Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// Preset accent colors for quick selection
const ACCENT_PRESETS = [
  { label: "Purple (Default)", value: "#a855f7" },
  { label: "Neon Blue", value: "#3b82f6" },
  { label: "Cyber Green", value: "#22c55e" },
  { label: "Hot Pink", value: "#ec4899" },
  { label: "Orange", value: "#f97316" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Red", value: "#ef4444" },
  { label: "Gold", value: "#f59e0b" },
];

export function SettingsForm({ initialSettings }: { initialSettings: Record<string, unknown> }) {
  const { theme, toggleTheme, setAccentColor } = useTheme();

  const [settings, setSettings] = useState({
    min_order_threshold: String(initialSettings.min_order_threshold ?? 300),
    shipping_fee: String(initialSettings.shipping_fee ?? 99),
    free_shipping_above: String(initialSettings.free_shipping_above ?? 999),
    default_accent_color: String(initialSettings.default_accent_color ?? "#a855f7"),
    announcement_banner: String(initialSettings.announcement_banner ?? ""),
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        // Apply the new accent color site-wide immediately
        setAccentColor(settings.default_accent_color);
        toast.success("Settings saved! Theme applied.");
      } else {
        toast.error("Failed to save settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccentChange = (color: string) => {
    setSettings({ ...settings, default_accent_color: color });
    // Live preview — apply immediately
    setAccentColor(color);
  };

  const inputClass = "w-full bg-[#0d0d14] border border-white/10 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* ── Theme Mode ─────────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--accent)]" /> Theme Mode
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
              theme === "dark"
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-white/10 text-slate-400 hover:border-white/30"
            }`}
          >
            <Moon className="w-4 h-4" /> Dark Mode
          </button>
          <button
            type="button"
            onClick={() => theme !== "light" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
              theme === "light"
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-white/10 text-slate-400 hover:border-white/30"
            }`}
          >
            <Sun className="w-4 h-4" /> Light Mode
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Theme preference is saved per-browser. The default accent color below applies site-wide for all visitors.
        </p>
      </div>

      {/* ── Accent Color ───────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--accent)]" /> Accent Color
        </h2>

        {/* Preset swatches */}
        <div>
          <label className={labelClass}>Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleAccentChange(preset.value)}
                title={preset.label}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  settings.default_accent_color === preset.value
                    ? "border-white scale-110 shadow-lg"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: preset.value }}
              />
            ))}
          </div>
        </div>

        {/* Custom color picker */}
        <div>
          <label className={labelClass}>Custom Color</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={settings.default_accent_color}
              onChange={(e) => handleAccentChange(e.target.value)}
              className="w-12 h-12 rounded-xl border border-white/10 bg-transparent cursor-pointer p-1"
            />
            <input
              value={settings.default_accent_color}
              onChange={(e) => handleAccentChange(e.target.value)}
              className={`${inputClass} flex-1 font-mono`}
              placeholder="#a855f7"
              pattern="^#[0-9a-fA-F]{6}$"
            />
            <div
              className="w-12 h-12 rounded-xl border border-white/10 flex-shrink-0"
              style={{ backgroundColor: settings.default_accent_color }}
              title="Preview"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live preview — changes apply immediately. Save to persist for all visitors.
          </p>
        </div>

        {/* Live preview */}
        <div className="p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5">
          <p className="text-xs text-slate-400 mb-2">Preview</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: settings.default_accent_color, boxShadow: `0 0 12px ${settings.default_accent_color}40` }}
            >
              Add to Cart
            </button>
            <span className="text-sm font-bold" style={{ color: settings.default_accent_color }}>₹1,499</span>
            <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: `${settings.default_accent_color}50`, color: settings.default_accent_color, backgroundColor: `${settings.default_accent_color}15` }}>
              Featured
            </span>
          </div>
        </div>
      </div>

      {/* ── Order Settings ─────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <h2 className="font-semibold text-white">Order Settings</h2>
        <div>
          <label className={labelClass}>Minimum Order Threshold (₹)</label>
          <input
            type="number"
            value={settings.min_order_threshold}
            onChange={(e) => setSettings({ ...settings, min_order_threshold: e.target.value })}
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">Cart total must exceed this to enable checkout</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Shipping Fee (₹)</label>
            <input
              type="number"
              value={settings.shipping_fee}
              onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Free Shipping Above (₹)</label>
            <input
              type="number"
              value={settings.free_shipping_above}
              onChange={(e) => setSettings({ ...settings, free_shipping_above: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Announcement Banner ────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <h2 className="font-semibold text-white">Announcement Banner</h2>
        <div>
          <label className={labelClass}>Banner Text</label>
          <input
            value={settings.announcement_banner}
            onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
            className={inputClass}
            placeholder="🎌 Free shipping on orders above ₹999! Use code OTAKU10 for 10% off."
          />
          <p className="text-xs text-slate-500 mt-1">Leave empty to hide the banner</p>
        </div>
        {settings.announcement_banner && (
          <div
            className="py-2 px-4 rounded-lg text-white text-sm text-center font-medium"
            style={{ backgroundColor: settings.default_accent_color }}
          >
            {settings.announcement_banner}
          </div>
        )}
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full">
        <Save className="w-4 h-4" /> Save All Settings
      </Button>
    </form>
  );
}
