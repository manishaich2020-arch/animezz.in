import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inventory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth();
  return session && (session.user as { role?: string })?.role === "admin" ? session : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { stock } = await req.json();
  if (typeof stock !== "number" || stock < 0) {
    return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
  }

  await db.update(inventory).set({ stock, updatedAt: new Date() }).where(eq(inventory.id, params.id));
  return NextResponse.json({ success: true });
}
