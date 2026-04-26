"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  accentColor: "#a855f7",
  setAccentColor: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultAccent?: string;
}

export function ThemeProvider({ children, defaultAccent = "#a855f7" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [accentColor, setAccentColorState] = useState(defaultAccent);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedTheme = (localStorage.getItem("otakuvault-theme") as Theme) ?? "dark";
    const savedAccent = localStorage.getItem("otakuvault-accent") ?? defaultAccent;
    setTheme(savedTheme);
    setAccentColorState(savedAccent);
    applyTheme(savedTheme, savedAccent);
  }, [defaultAccent]);

  const applyTheme = (t: Theme, accent: string) => {
    const root = document.documentElement;

    // Apply accent color
    root.style.setProperty("--accent", accent);
    // Generate glow from accent
    root.style.setProperty("--glow", `${accent}20`);
    root.style.setProperty("--breath-color", `${accent}40`);

    if (t === "light") {
      root.style.setProperty("--bg", "#f8f9fa");
      root.style.setProperty("--bg-card", "#ffffff");
      root.style.setProperty("--bg-card-hover", "#f1f3f5");
      root.style.setProperty("--border", "#e2e8f0");
      root.style.setProperty("--text", "#1a1a2e");
      root.style.setProperty("--text-muted", "#64748b");
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    } else {
      root.style.setProperty("--bg", "#0a0a0f");
      root.style.setProperty("--bg-card", "#111118");
      root.style.setProperty("--bg-card-hover", "#16161f");
      root.style.setProperty("--border", "#1e1e2e");
      root.style.setProperty("--text", "#e2e8f0");
      root.style.setProperty("--text-muted", "#64748b");
      root.classList.remove("light-theme");
      root.classList.add("dark-theme");
    }
  };

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("otakuvault-theme", next);
    applyTheme(next, accentColor);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem("otakuvault-accent", color);
    applyTheme(theme, color);
  };

  // Prevent flash of wrong theme
  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}
