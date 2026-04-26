"use client";

import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  subtotal: string | number | null;
  shippingFee: string | number | null;
  discount: string | number | null;
  total: string | number | null;
  paymentMode: string | null;
  payuTxnId: string | null;
  items: OrderItem[];
}

export function InvoiceDownload({ order }: { order: Order }) {
  const handleDownload = () => {
    const lines: string[] = [];
    lines.push("=".repeat(50));
    lines.push("           OTAKUVAULT — INVOICE");
    lines.push("           animezz.in");
    lines.push("=".repeat(50));
    lines.push(`Order Number : ${order.orderNumber}`);
    lines.push(`Date         : ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
    lines.push(`Status       : ${order.status}`);
    lines.push(`Payment      : ${order.paymentMode ?? "—"}`);
    if (order.payuTxnId) lines.push(`Txn ID       : ${order.payuTxnId}`);
    lines.push("-".repeat(50));
    lines.push("ITEMS");
    lines.push("-".repeat(50));
    order.items.forEach((item) => {
      lines.push(`${item.productName}`);
      lines.push(`  Qty: ${item.quantity}  ×  ₹${parseFloat(String(item.unitPrice)).toLocaleString("en-IN")}  =  ₹${parseFloat(String(item.totalPrice)).toLocaleString("en-IN")}`);
    });
    lines.push("-".repeat(50));
    lines.push(`Subtotal     : ₹${parseFloat(String(order.subtotal ?? 0)).toLocaleString("en-IN")}`);
    if (parseFloat(String(order.discount ?? 0)) > 0) {
      lines.push(`Discount     : -₹${parseFloat(String(order.discount)).toLocaleString("en-IN")}`);
    }
    lines.push(`Shipping     : ${parseFloat(String(order.shippingFee ?? 0)) === 0 ? "FREE" : "₹" + parseFloat(String(order.shippingFee)).toLocaleString("en-IN")}`);
    lines.push(`TOTAL        : ₹${parseFloat(String(order.total ?? 0)).toLocaleString("en-IN")}`);
    lines.push("=".repeat(50));
    lines.push("Thank you for shopping at OtakuVault!");
    lines.push("For support: support@animezz.in");
    lines.push("=".repeat(50));

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="w-full">
      <Download className="w-4 h-4" />
      Download Invoice
    </Button>
  );
}
