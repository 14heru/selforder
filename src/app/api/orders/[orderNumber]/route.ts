import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { orderNumber } = await params;

  // Validasi format nomor pesanan sebelum mengakses database.
  if (
    typeof orderNumber !== "string" ||
    orderNumber.length > 40 ||
    !/^SO-\d+-[A-F0-9]{8}$/.test(orderNumber)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Nomor pesanan tidak valid.",
      },
      { status: 400 },
    );
  }

  try {
    // Ambil informasi utama pesanan dan nomor meja.
    const orderResult = await db.query(
      `SELECT
         o.id,
         o.order_number,
         o.status,
         o.total_amount,
         o.notes,
         o.created_at,
         rt.table_number
       FROM orders AS o
       INNER JOIN restaurant_tables AS rt
         ON rt.id = o.table_id
       WHERE o.order_number = $1
       LIMIT 1`,
      [orderNumber],
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pesanan tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const order = orderResult.rows[0];

    // Ambil detail produk yang tersimpan saat pesanan dibuat.
    const itemsResult = await db.query(
      `SELECT
         product_id,
         product_name,
         quantity,
         unit_price,
         subtotal
       FROM order_items
       WHERE order_id = $1
       ORDER BY id ASC`,
      [order.id],
    );

    const items = itemsResult.rows.map((item) => ({
      productId: Number(item.product_id),
      productName: item.product_name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.subtotal),
    }));

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        tableNumber: order.table_number,
        status: order.status,
        totalAmount: Number(order.total_amount),
        notes: order.notes,
        createdAt: order.created_at,
        items,
      },
    });
  } catch (error) {
    console.error("Get order detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail pesanan.",
      },
      { status: 500 },
    );
  }
}
