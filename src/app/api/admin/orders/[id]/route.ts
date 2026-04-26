import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth();
  return session && (session.user as { role?: string })?.role === "admin" ? session : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status, paymentStatus } = await req.json();

  await db.update(orders).set({
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
    updatedAt: new Date(),
  }).where(eq(orders.id, params.id));

  return NextResponse.json({ success: true });
}
