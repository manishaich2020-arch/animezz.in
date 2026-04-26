import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
    }

    const { code, orderTotal } = parsed.data;

    const coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true)),
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Coupon not found" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "Coupon has expired" });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "Coupon usage limit reached" });
    }

    const minOrder = parseFloat(coupon.minOrder ?? "0");
    if (orderTotal < minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of ₹${minOrder} required for this coupon`,
      });
    }

    const value = parseFloat(coupon.value);
    let discount = 0;

    if (coupon.type === "percent") {
      discount = Math.round((orderTotal * value) / 100);
    } else {
      discount = value;
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount,
      type: coupon.type,
      value,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
