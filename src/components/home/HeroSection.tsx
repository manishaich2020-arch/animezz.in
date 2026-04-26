"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const heroImages = [
  "/hero-images/Demon Slayer.png",
  "/hero-images/Goku & Vegeta.png",
  "/hero-images/Jujutsu Kaisen.png",
  "/hero-images/Luffy & Zoro.png",
  "/hero-images/Naruto & Sasuke.png",
  "/hero-images/Solo Leveling.png"
];

export function HeroSection() {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 4000); // 4 seconds interval
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Premium Anime Merchandise
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              Your Anime{" "}
              <span className="neon-text breathe-text">Universe</span>
              <br />
              Starts Here
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Shop premium action figures, XL mouse pads, katana replicas, and more.
              Fast shipping across India. Authentic collector-grade merchandise.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="breathe">
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/category/action-figures">
                <Button size="lg" variant="outline">
                  Browse Figures
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/5">
              {[
                { value: "500+", label: "Products" },
                { value: "10K+", label: "Happy Otakus" },
                { value: "4.8★", label: "Avg Rating" },
                { value: "2-5 Days", label: "Delivery" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-[var(--accent)]">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Image Carousel (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center justify-center relative h-[600px] w-full">
            <AnimatePresence>
              <motion.div
                key={currentImageIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div 
                  className="relative w-full h-full max-w-[550px] max-h-[550px]"
                  style={{
                    WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 80%)",
                    maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)"
                  }}
                >
                  {/* Decorative glow behind image */}
                  <div className="absolute inset-0 bg-[var(--accent)]/30 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
                  <Image
                    src={heroImages[currentImageIdx]}
                    alt="Anime Merchandise"
                    fill
                    className="object-contain mix-blend-screen"
                    sizes="(min-width: 1024px) 550px, 100vw"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
