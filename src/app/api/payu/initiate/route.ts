import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inventory, orders, orderItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/utils";

const schema = z.object({
  items: z.array(
    z.object({
      inventoryId: z.string().uuid(),
      productId: z.string().uuid(),
      productName: z.string(),
      productImg: z.string().optional(),
      variant: z.record(z.string(), z.string()).optional(),
      quantity: z.number().int().min(1),
      unitPrice: z.number().min(0),
    })
  ),
  addressId: z.string().uuid(),
  couponCode: z.string().optional(),
  couponDiscount: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { items, addressId, couponCode, couponDiscount = 0 } = parsed.data;

    // Pre-payment stock check + reserve
    for (const item of items) {
      const inv = await db.query.inventory.findFirst({
        where: eq(inventory.id, item.inventoryId),
      });

      if (!inv) {
        return NextResponse.json({ error: `Item not found: ${item.productName}` }, { status: 400 });
      }

      const available = inv.stock - inv.reserved;
      if (available < item.quantity) {
        return NextResponse.json({
          error: `OUT_OF_STOCK`,
          productName: item.productName,
        }, { status: 400 });
      }

      // Reserve stock
      await db
        .update(inventory)
        .set({ reserved: sql`${inventory.reserved} + ${item.quantity}` })
        .where(eq(inventory.id, item.inventoryId));
    }

    // Calculate totals
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const total = Math.max(0, subtotal - couponDiscount + shipping);

    // Create pending order
    const orderNumber = generateOrderNumber();
    const userId = (session.user as { id: string }).id;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        addressId,
        status: "pending",
        subtotal: String(subtotal),
        shippingFee: String(shipping),
        discount: String(couponDiscount),
        total: String(total),
        couponCode: couponCode ?? null,
        paymentStatus: "pending",
      })
      .returning();

    // Insert order items
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        inventoryId: item.inventoryId,
        productName: item.productName,
        productImg: item.productImg ?? null,
        variant: item.variant ?? {},
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        totalPrice: String(item.unitPrice * item.quantity),
      }))
    );

    // Generate PayU hash
    const key = process.env.PAYU_MERCHANT_KEY ?? "";
    const salt = process.env.PAYU_MERCHANT_SALT ?? "";
    const txnid = order.id;
    const amount = total.toFixed(2);
    const productinfo = `OtakuVault Order ${orderNumber}`;
    const firstname = session.user.name ?? "Customer";
    const email = session.user.email ?? "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // PayU hash: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return NextResponse.json({
      success: true,
      orderId: order.id,
      payuParams: {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        hash,
        surl: `${appUrl}/order/${order.id}/success`,
        furl: `${appUrl}/order/${order.id}/failure`,
        service_provider: "payu_paisa",
      },
      payuUrl: `${process.env.PAYU_BASE_URL ?? "https://test.payu.in"}/_payment`,
    });
  } catch (error) {
    console.error("PayU initiate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
