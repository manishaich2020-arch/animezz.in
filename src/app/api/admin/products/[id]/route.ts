import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, inventory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  comparePrice: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  accentColor: z.string().optional(),
  themeBg: z.string().optional(),
  minOrderQty: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  inventoryId: z.string().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { stock, inventoryId, ...productData } = parsed.data;

    // Update product
    const [updated] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, params.id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Update stock if provided
    if (stock !== undefined) {
      if (inventoryId) {
        await db.update(inventory).set({ stock, updatedAt: new Date() }).where(eq(inventory.id, inventoryId));
      } else {
        // Create inventory if missing
        await db.insert(inventory).values({
          productId: params.id,
          sku: `OV-${params.id.slice(0, 8).toUpperCase()}`,
          variant: {},
          stock,
          reserved: 0,
        }).onConflictDoNothing();
      }
    }

    return NextResponse.json({ product: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await db.update(products).set({ isActive: false }).where(eq(products.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
