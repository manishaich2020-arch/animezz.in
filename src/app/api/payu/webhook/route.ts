import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, inventory, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash: receivedHash,
      mihpayid,
      mode,
    } = params;

    // Verify hash (reverse hash for webhook)
    const salt = process.env.PAYU_MERCHANT_SALT ?? "";
    const key = process.env.PAYU_MERCHANT_KEY ?? "";
    const reverseHashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = crypto.createHash("sha512").update(reverseHashString).digest("hex");

    if (expectedHash !== receivedHash) {
      console.error("PayU hash mismatch");
      return NextResponse.json({ error: "Hash mismatch" }, { status: 400 });
    }

    // Find order by id (txnid = order.id)
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, txnid),
      with: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "success") {
      // Update order
      await db
        .update(orders)
        .set({
          status: "confirmed",
          paymentStatus: "paid",
          payuTxnId: txnid,
          payuMihpayid: mihpayid,
          paymentMode: mode,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, txnid));

      // Deduct stock + release reservation for each item
      for (const item of order.items) {
        if (!item.inventoryId) continue;
        await db
          .update(inventory)
          .set({
            stock: sql`${inventory.stock} - ${item.quantity}`,
            reserved: sql`${inventory.reserved} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(inventory.id, item.inventoryId));

        // Update total_sold
        if (item.productId) {
          await db
            .update(products)
            .set({ totalSold: sql`${products.totalSold} + ${item.quantity}` })
            .where(eq(products.id, item.productId));
        }
      }
    } else {
      // Payment failed — release reservations
      await db
        .update(orders)
        .set({
          status: "cancelled",
          paymentStatus: "failed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, txnid));

      for (const item of order.items) {
        if (!item.inventoryId) continue;
        await db
          .update(inventory)
          .set({
            reserved: sql`${inventory.reserved} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(inventory.id, item.inventoryId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PayU webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
