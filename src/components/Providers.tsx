"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";

interface ProvidersProps {
  children: React.ReactNode;
  defaultAccent?: string;
}

export function Providers({ children, defaultAccent }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider defaultAccent={defaultAccent}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
