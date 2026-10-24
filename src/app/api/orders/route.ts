import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type OrderItemInput = {
  productId: number;
  quantity: number;
};

type CreateOrderInput = {
  tableId: number;
  items: OrderItemInput[];
  notes?: string;
};

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Format JSON tidak valid." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, message: "Data pesanan tidak valid." },
      { status: 400 },
    );
  }

  const input = body as Partial<CreateOrderInput>;

  if (
    !isPositiveInteger(input.tableId) ||
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 50
  ) {
    return NextResponse.json(
      { success: false, message: "Meja atau item pesanan tidak valid." },
      { status: 400 },
    );
  }

  const notes = input.notes ?? "";

  if (typeof notes !== "string" || notes.length > 1000) {
    return NextResponse.json(
      { success: false, message: "Catatan maksimal 1000 karakter." },
      { status: 400 },
    );
  }

  const quantities = new Map<number, number>();

  for (const item of input.items) {
    if (
      !item ||
      typeof item !== "object" ||
      !isPositiveInteger(item.productId) ||
      !isPositiveInteger(item.quantity) ||
      item.quantity > 100
    ) {
      return NextResponse.json(
        { success: false, message: "Produk atau jumlah tidak valid." },
        { status: 400 },
      );
    }

    const newQuantity = (quantities.get(item.productId) ?? 0) + item.quantity;

    if (newQuantity > 100) {
      return NextResponse.json(
        { success: false, message: "Jumlah produk maksimal 100 per pesanan." },
        { status: 400 },
      );
    }

    quantities.set(item.productId, newQuantity);
  }

  const client = await db.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const tableResult = await client.query(
      `SELECT id
       FROM restaurant_tables
       WHERE id = $1 AND is_active = TRUE
       FOR SHARE`,
      [input.tableId],
    );

    if (tableResult.rowCount !== 1) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Meja tidak ditemukan atau tidak aktif." },
        { status: 400 },
      );
    }

    const productIds = [...quantities.keys()];

    const productResult = await client.query(
      `SELECT id, name, price
       FROM products
       WHERE id = ANY($1::bigint[])
         AND is_available = TRUE
       ORDER BY id
       FOR SHARE`,
      [productIds],
    );

    if (productResult.rows.length !== productIds.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Ada produk yang tidak tersedia." },
        { status: 400 },
      );
    }

    const products = new Map<
      number,
      { id: number; name: string; price: number }
    >();

    for (const row of productResult.rows) {
      const id = Number(row.id);
      const price = Number(row.price);

      if (
        !Number.isSafeInteger(id) ||
        !Number.isSafeInteger(price) ||
        price < 0
      ) {
        throw new Error("Data produk tidak valid di database.");
      }

      products.set(id, {
        id,
        name: row.name,
        price,
      });
    }

    let totalAmount = 0;

    const orderItems = productIds.map((productId) => {
      const product = products.get(productId);

      if (!product) {
        throw new Error("Produk tidak ditemukan.");
      }

      const quantity = quantities.get(productId)!;
      const subtotal = product.price * quantity;

      if (!Number.isSafeInteger(subtotal)) {
        throw new Error("Subtotal pesanan melebihi batas yang didukung.");
      }

      totalAmount += subtotal;

      if (!Number.isSafeInteger(totalAmount)) {
        throw new Error("Total pesanan melebihi batas yang didukung.");
      }

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
      };
    });

    const orderNumber = `SO-${Date.now()}-${crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 8)
      .toUpperCase()}`;

    const orderResult = await client.query(
      `INSERT INTO orders (
         order_number,
         table_id,
         total_amount,
         notes
       )
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_number, status, total_amount, created_at`,
      [orderNumber, input.tableId, totalAmount, notes],
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           product_name,
           quantity,
           unit_price
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice,
        ],
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil dibuat.",
        order: {
          id: Number(order.id),
          orderNumber: order.order_number,
          status: order.status,
          totalAmount: Number(order.total_amount),
          createdAt: order.created_at,
          items: orderItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK").catch(() => undefined);
    }

    console.error("Create order error:", error);

    return NextResponse.json(
      { success: false, message: "Pesanan gagal disimpan." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
