import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

async function requireAdmin() {
  const session = await auth();
  return session && (session.user as { role?: string })?.role === "admin" ? session : null;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { code, type, value, minOrder, maxUses, expiresAt } = body;

  if (!code || !type || !value) {
    return NextResponse.json({ error: "code, type, and value are required" }, { status: 400 });
  }

  try {
    const [coupon] = await db.insert(coupons).values({
      code: code.toUpperCase(),
      type,
      value: String(value),
      minOrder: minOrder ? String(minOrder) : "0",
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
    }).returning();

    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }
}
