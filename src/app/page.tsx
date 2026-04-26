import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

// Revalidate homepage every 5 minutes
export const revalidate = 300;

export const metadata = {
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? "https://animezz.in",
  },
};

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-white mb-8">
          Shop by <span className="neon-text">Category</span>
        </h2>
        <Suspense fallback={<div className="grid grid-cols-3 md:grid-cols-6 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>}>
          <CategoryGrid />
        </Suspense>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            <span className="neon-text">Featured</span> Products
          </h2>
          <a href="/products?featured=true" className="text-sm text-[var(--accent)] hover:brightness-110">
            View all →
          </a>
        </div>
        <Suspense fallback={<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><ProductCardSkeleton key={i}/>)}</div>}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            New <span className="neon-text">Arrivals</span>
          </h2>
          <a href="/products?sort=newest" className="text-sm text-[var(--accent)] hover:brightness-110">
            View all →
          </a>
        </div>
        <Suspense fallback={<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><ProductCardSkeleton key={i}/>)}</div>}>
          <NewArrivals />
        </Suspense>
      </section>
    </div>
  );
}
