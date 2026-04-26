"use client";

/**
 * Lightweight CSS-only particle background — no canvas, no JS animation loop.
 * Uses pre-generated random positions with CSS animations for zero runtime cost.
 * Renders 15 particles globally on every page.
 */
export function ParticleBackground() {
  // Pre-computed random values to avoid hydration mismatch
  const particles = [
    { left: "8%",  top: "12%", delay: "0s",   dur: "8s"  },
    { left: "23%", top: "45%", delay: "1.2s", dur: "10s" },
    { left: "67%", top: "8%",  delay: "2.4s", dur: "7s"  },
    { left: "45%", top: "72%", delay: "0.6s", dur: "9s"  },
    { left: "89%", top: "33%", delay: "3.1s", dur: "11s" },
    { left: "12%", top: "88%", delay: "1.8s", dur: "8s"  },
    { left: "56%", top: "55%", delay: "4.2s", dur: "10s" },
    { left: "78%", top: "78%", delay: "0.3s", dur: "7s"  },
    { left: "34%", top: "22%", delay: "2.7s", dur: "9s"  },
    { left: "91%", top: "61%", delay: "1.5s", dur: "11s" },
    { left: "5%",  top: "50%", delay: "3.8s", dur: "8s"  },
    { left: "62%", top: "38%", delay: "0.9s", dur: "10s" },
    { left: "48%", top: "92%", delay: "2.1s", dur: "7s"  },
    { left: "19%", top: "67%", delay: "4.5s", dur: "9s"  },
    { left: "83%", top: "15%", delay: "1.1s", dur: "11s" },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[var(--accent)] opacity-20"
          style={{
            left: p.left,
            top: p.top,
            animation: `particle-drift ${p.dur} ${p.delay} infinite`,
          }}
        />
      ))}
      {/* Subtle gradient orbs */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-[0.03]"
        style={{
          background: "var(--accent)",
          top: "10%",
          left: "5%",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-[0.03]"
        style={{
          background: "var(--accent)",
          bottom: "15%",
          right: "10%",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
