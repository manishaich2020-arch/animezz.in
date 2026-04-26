/**
 * Seed script — populates the database with demo categories and products
 * based on the demo images in /public/products/
 *
 * Run with: npm run db:seed
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { config } from "dotenv";

// Load .env.local before anything else
config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Categories ──────────────────────────────────────────────
  const categoryData = [
    { name: "Mouse Pads", slug: "mouse-pads", imageUrl: "/products/attack-on-titan-mouse-pad.jpeg" },
    { name: "Action Figures", slug: "action-figures", imageUrl: "/products/goku-action-figure.jpeg" },
    { name: "Mini Figures", slug: "mini-figures", imageUrl: "/products/shinchan-toy.jpeg" },
    { name: "Swords & Prop Replicas", slug: "swords-prop-replicas", imageUrl: "/products/zoro-katana.jpeg" },
    { name: "Wall Art", slug: "wall-art", imageUrl: null },
    { name: "Apparel", slug: "apparel", imageUrl: null },
    { name: "Keychains & Accessories", slug: "keychains-accessories", imageUrl: null },
  ];

  const insertedCategories: Record<string, string> = {};

  for (const cat of categoryData) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, cat.slug),
    });
    if (!existing) {
      const [inserted] = await db.insert(schema.categories).values(cat).returning();
      insertedCategories[cat.slug] = inserted.id;
      console.log(`  ✓ Category: ${cat.name}`);
    } else {
      insertedCategories[cat.slug] = existing.id;
      console.log(`  ~ Category exists: ${cat.name}`);
    }
  }

  // ── Products ─────────────────────────────────────────────────
  const productData = [
    // Mouse Pads
    {
      name: "Attack on Titan XL Mouse Pad",
      slug: "attack-on-titan-xl-mouse-pad",
      description: "Extra-large desk mat featuring the iconic Survey Corps wings. Non-slip rubber base, smooth micro-weave surface. Perfect for both gaming and desk setups.",
      categorySlug: "mouse-pads",
      price: "799",
      comparePrice: "1199",
      images: ["/products/attack-on-titan-mouse-pad.jpeg"],
      accentColor: "#22c55e",
      isFeatured: true,
      tags: ["attack on titan", "aot", "mouse pad", "desk mat", "survey corps"],
      stock: 50,
    },
    {
      name: "Solo Leveling Arise Mouse Pad",
      slug: "solo-leveling-arise-mouse-pad",
      description: "Sung Jin-Woo themed XL mouse pad. Dark fantasy artwork with vibrant colors. Water-resistant surface, stitched edges for durability.",
      categorySlug: "mouse-pads",
      price: "849",
      comparePrice: "1299",
      images: ["/products/solo-leveling-mouse-pad.jpeg"],
      accentColor: "#6366f1",
      isFeatured: true,
      tags: ["solo leveling", "sung jin woo", "mouse pad", "gaming"],
      stock: 35,
    },
    // Action Figures
    {
      name: "Goku Super Saiyan Action Figure",
      slug: "goku-super-saiyan-action-figure",
      description: "Highly detailed Goku Super Saiyan figure, 18cm tall. 12 points of articulation. Includes Kamehameha effect part and alternate hands.",
      categorySlug: "action-figures",
      price: "1499",
      comparePrice: "1999",
      images: ["/products/goku-action-figure.jpeg", "/products/goku-action-figure-2.jpeg"],
      accentColor: "#f59e0b",
      isFeatured: true,
      tags: ["goku", "dragon ball z", "dbz", "action figure", "super saiyan"],
      stock: 20,
    },
    {
      name: "Naruto Uzumaki Action Figure",
      slug: "naruto-uzumaki-action-figure",
      description: "Naruto in his iconic orange jumpsuit. 16cm articulated figure with Rasengan effect part. Collector-grade paint finish.",
      categorySlug: "action-figures",
      price: "1299",
      comparePrice: "1799",
      images: ["/products/naruto-action-figure.jpeg"],
      accentColor: "#f97316",
      isFeatured: false,
      tags: ["naruto", "uzumaki", "action figure", "konoha", "rasengan"],
      stock: 25,
    },
    {
      name: "Gojo Satoru Infinity Action Figure",
      slug: "gojo-satoru-infinity-action-figure",
      description: "Gojo Satoru with his signature blindfold and Infinity technique. 17cm figure with domain expansion base. Jujutsu Kaisen collector's item.",
      categorySlug: "action-figures",
      price: "1699",
      comparePrice: "2299",
      images: ["/products/gojo-satoru-action-figure.jpeg"],
      accentColor: "#06b6d4",
      isFeatured: true,
      tags: ["gojo satoru", "jujutsu kaisen", "jjk", "action figure", "infinity"],
      stock: 15,
    },
    {
      name: "Demon Slayer Tanjiro Action Figure",
      slug: "demon-slayer-tanjiro-action-figure",
      description: "Tanjiro Kamado in Water Breathing stance. 16cm articulated figure with water effect parts and Nichirin sword accessory.",
      categorySlug: "action-figures",
      price: "1399",
      comparePrice: "1899",
      images: ["/products/demon-slayer-action-figure-1.jpeg", "/products/demon-slayer-action-figure-2.jpeg"],
      accentColor: "#3b82f6",
      isFeatured: false,
      tags: ["demon slayer", "tanjiro", "kimetsu no yaiba", "action figure", "water breathing"],
      stock: 18,
    },
    {
      name: "Jujutsu Kaisen Yuji Itadori Figure",
      slug: "jujutsu-kaisen-yuji-itadori-figure",
      description: "Yuji Itadori in battle pose. 15cm figure with Divergent Fist effect part. Collector-grade finish with detailed uniform.",
      categorySlug: "action-figures",
      price: "1249",
      comparePrice: "1699",
      images: ["/products/jujutsu-kaisen-action-figure.jpeg"],
      accentColor: "#ec4899",
      isFeatured: false,
      tags: ["jujutsu kaisen", "yuji itadori", "jjk", "action figure"],
      stock: 22,
    },
    // Mini Figures
    {
      name: "Shin-chan Chibi Figure Set",
      slug: "shinchan-chibi-figure-set",
      description: "Adorable Shin-chan chibi figure set. Includes 3 poses — classic, action mask, and elephant pose. Perfect desk companions.",
      categorySlug: "mini-figures",
      price: "599",
      comparePrice: "899",
      images: ["/products/shinchan-toy.jpeg", "/products/shinchan-toy-2.jpeg", "/products/shinchan-toy-3.jpeg"],
      accentColor: "#eab308",
      isFeatured: false,
      tags: ["shinchan", "shin chan", "chibi", "mini figure", "crayon shinchan"],
      stock: 40,
    },
    // Swords & Prop Replicas
    {
      name: "Roronoa Zoro Three-Sword Katana Replica",
      slug: "roronoa-zoro-katana-replica",
      description: "Replica of Zoro's iconic Wado Ichimonji katana. 90cm total length, stainless steel blade, traditional tsuba. Includes display stand.",
      categorySlug: "swords-prop-replicas",
      price: "2499",
      comparePrice: "3499",
      images: ["/products/zoro-katana.jpeg", "/products/zoro-katana-2.jpeg"],
      accentColor: "#10b981",
      isFeatured: true,
      tags: ["zoro", "one piece", "katana", "sword", "wado ichimonji", "replica"],
      stock: 10,
    },
    {
      name: "Solo Leveling Shadow Monarch Katana",
      slug: "solo-leveling-shadow-monarch-katana",
      description: "Sung Jin-Woo's Shadow Monarch blade replica. Dark finish with purple glow accents. 85cm, includes wall mount display.",
      categorySlug: "swords-prop-replicas",
      price: "2799",
      comparePrice: "3999",
      images: ["/products/solo-leveling-katana.jpeg"],
      accentColor: "#8b5cf6",
      isFeatured: true,
      tags: ["solo leveling", "shadow monarch", "katana", "sword", "replica", "sung jin woo"],
      stock: 8,
    },
  ];

  for (const p of productData) {
    const existing = await db.query.products.findFirst({
      where: eq(schema.products.slug, p.slug),
    });
    if (existing) {
      console.log(`  ~ Product exists: ${p.name}`);
      continue;
    }

    const categoryId = insertedCategories[p.categorySlug];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categorySlug, stock, ...productFields } = p;

    const [product] = await db
      .insert(schema.products)
      .values({
        ...productFields,
        categoryId,
        isFeatured: productFields.isFeatured,
      })
      .returning();

    // Create default inventory entry
    await db.insert(schema.inventory).values({
      productId: product.id,
      sku: `OV-${product.id.slice(0, 8).toUpperCase()}`,
      variant: {},
      stock,
      reserved: 0,
    });

    console.log(`  ✓ Product: ${p.name} (stock: ${stock})`);
  }

  // ── Site Settings ────────────────────────────────────────────
  const settings = [
    { key: "min_order_threshold", value: 300 },
    { key: "default_accent_color", value: "#a855f7" },
    { key: "shipping_fee", value: 99 },
    { key: "free_shipping_above", value: 999 },
    { key: "announcement_banner", value: "🎌 Free shipping on orders above ₹999! Use code OTAKU10 for 10% off." },
  ];

  for (const setting of settings) {
    const existing = await db.query.siteSettings.findFirst({
      where: eq(schema.siteSettings.key, setting.key),
    });
    if (!existing) {
      await db.insert(schema.siteSettings).values({
        key: setting.key,
        value: setting.value,
      });
      console.log(`  ✓ Setting: ${setting.key}`);
    }
  }

  // ── Demo Coupon ──────────────────────────────────────────────
  const couponExists = await db.query.coupons.findFirst({
    where: eq(schema.coupons.code, "OTAKU10"),
  });
  if (!couponExists) {
    await db.insert(schema.coupons).values({
      code: "OTAKU10",
      type: "percent",
      value: "10",
      minOrder: "300",
      maxUses: 1000,
      isActive: true,
    });
    console.log("  ✓ Coupon: OTAKU10 (10% off)");
  }

  console.log("\n✅ Seeding complete!");
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    pool.end();
    process.exit(1);
  });
