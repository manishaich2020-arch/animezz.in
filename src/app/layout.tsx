import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";
import { Providers } from "@/components/Providers";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { SocialFloat } from "@/components/ui/SocialFloat";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Preload only the weights we actually use
  weight: ["400", "500", "600", "700", "900"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://animezz.in";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Animezz — #1 Anime Merchandise Store India | Buy Action Figures, Mouse Pads & More",
    template: "%s | Animezz — Anime Merchandise India",
  },
  description:
    "India's best anime merchandise store. Buy authentic action figures, XL mouse pads, katana replicas, Goku, Naruto, Demon Slayer, Jujutsu Kaisen collectibles. Fast shipping across India. COD available.",
  keywords: [
    "anime merchandise India",
    "buy anime figures India",
    "action figures online India",
    "anime mouse pad India",
    "Goku figure India",
    "Naruto merchandise",
    "Demon Slayer figures",
    "Jujutsu Kaisen collectibles",
    "anime store India",
    "otaku store India",
    "anime katana replica",
    "anime collectibles buy online",
    "best anime shop India",
    "official anime merchandise",
    "animezz",
    "Animezz",
  ],
  authors: [{ name: "Animezz", url: APP_URL }],
  creator: "Animezz",
  publisher: "Animezz",
  category: "Shopping",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "Animezz",
    title: "Animezz — #1 Anime Merchandise Store India",
    description: "India's best anime merchandise store. Authentic action figures, mouse pads, katanas & more. Fast shipping.",
    images: [
      {
        url: `${APP_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Animezz — Premium Anime Merchandise India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Animezz — #1 Anime Merchandise Store India",
    description: "Buy authentic anime figures, mouse pads, katanas & more. Fast shipping across India.",
    images: [`${APP_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // NOTE: Per-page canonical is set in generateMetadata for each page.
  // Root layout canonical is intentionally omitted to avoid overriding page-level canonicals.
};

async function getDefaultAccent(): Promise<string> {
  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, "default_accent_color"),
    });
    return (setting?.value as string) ?? "#a855f7";
  } catch {
    return "#a855f7";
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultAccent = await getDefaultAccent();

  return (
    <html lang="en" className={`${inter.variable} dark-theme`} suppressHydrationWarning>
      <head>
        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Animezz",
              url: APP_URL,
              logo: `${APP_URL}/logo.jpg`,
              description: "India's best anime merchandise store",
              contactPoint: {
                "@type": "ContactPoint",
                email: "support@animezz.in",
                contactType: "customer service",
                areaServed: "IN",
                availableLanguage: "English",
              },
              sameAs: [
                "https://www.instagram.com/animezz.in",
                "https://www.facebook.com/animezz.2024",
              ],
            }),
          }}
        />
        {/* Structured data — WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Animezz",
              url: APP_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${APP_URL}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased" suppressHydrationWarning>
        <Providers defaultAccent={defaultAccent}>
          {/* Global particle background — visible on all pages */}
          <ParticleBackground />

          <div className="relative z-10">
            <AnnouncementBanner />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </div>

          <Toaster />
          {/* Floating social icons — WhatsApp, Instagram, Facebook */}
          <SocialFloat />
        </Providers>
      </body>
    </html>
  );
}
