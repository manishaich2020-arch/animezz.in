import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, inventory } from "@/lib/db/schema";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.string(),
  comparePrice: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  accentColor: z.string().optional(),
  themeBg: z.string().optional(),
  minOrderQty: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { stock, ...productData } = parsed.data;

    const [product] = await db.insert(products).values({
      ...productData,
      comparePrice: productData.comparePrice ?? null,
      categoryId: productData.categoryId ?? null,
      accentColor: productData.accentColor ?? null,
      themeBg: productData.themeBg ?? null,
    }).returning();

    await db.insert(inventory).values({
      productId: product.id,
      sku: `OV-${product.id.slice(0, 8).toUpperCase()}`,
      variant: {},
      stock,
      reserved: 0,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    if (msg.includes("unique")) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
