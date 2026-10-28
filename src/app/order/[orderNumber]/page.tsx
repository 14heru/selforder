import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

type OrderPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

type OrderRow = {
  id: string | number;
  order_number: string;
  status: string;
  total_amount: string | number;
  notes: string;
  created_at: string | Date;
  table_number: string;
};

type OrderItemRow = {
  product_id: string | number;
  product_name: string;
  quantity: string | number;
  unit_price: string | number;
  subtotal: string | number;
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu Diproses",
  CONFIRMED: "Pesanan Dikonfirmasi",
  PREPARING: "Sedang Disiapkan",
  READY: "Pesanan Siap",
  COMPLETED: "Pesanan Selesai",
  CANCELLED: "Pesanan Dibatalkan",
};

async function OrderConfirmationContent({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  // Validasi format nomor pesanan.
  if (!/^SO-\d+-[A-F0-9]{8}$/.test(orderNumber) || orderNumber.length > 40) {
    notFound();
  }

  const orderResult = await db.query<OrderRow>(
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
    notFound();
  }

  const order = orderResult.rows[0];

  const itemsResult = await db.query<OrderItemRow>(
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

  const createdAt = new Date(order.created_at);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(createdAt);

  const statusLabel = statusLabels[order.status] ?? "Status Tidak Diketahui";

  const isCancelled = order.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-[#24251f] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Brand */}
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#245c43] text-xl font-semibold text-white">
              S
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">selforder</p>
              <p className="text-[11px] tracking-wide text-stone-500">
                GOOD FOOD, GOOD MOOD
              </p>
            </div>
          </Link>

          <span className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600">
            {order.table_number}
          </span>
        </header>

        {/* Confirmation */}
        <section className="overflow-hidden rounded-[28px] border border-stone-200/80 bg-white shadow-sm">
          <div className="bg-[#214e39] px-6 py-9 text-center text-white sm:px-10 sm:py-12">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-[#e9f0d7] text-[#245c43]"
              }`}
              aria-hidden="true"
            >
              {isCancelled ? "!" : "✓"}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {isCancelled ? "Informasi Pesanan" : "Pesanan Berhasil"}
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {isCancelled
                ? "Pesanan Dibatalkan"
                : "Terima kasih sudah memesan!"}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/75">
              {isCancelled
                ? "Pesanan ini berstatus dibatalkan. Silakan hubungi petugas jika membutuhkan bantuan."
                : "Pesananmu sudah tercatat di sistem. Simpan nomor pesanan ini untuk memudahkan pengecekan."}
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {/* Order identity */}
            <div className="rounded-2xl border border-dashed border-stone-300 bg-[#faf9f6] p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Nomor Pesanan
              </p>

              <p className="mt-2 break-all text-xl font-bold tracking-tight text-[#245c43] sm:text-2xl">
                {order.order_number}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200">
                  Meja {order.table_number}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    isCancelled
                      ? "bg-red-50 text-red-700"
                      : order.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-[#e9f0d7] text-[#315b3e]"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <p className="mt-3 text-xs text-stone-500">{formattedDate}</p>
            </div>

            {/* Items */}
            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rincian Pesanan</h2>
                <span className="text-xs text-stone-500">
                  {items.reduce((total, item) => total + item.quantity, 0)} item
                </span>
              </div>

              <div className="mt-4 divide-y divide-stone-100">
                {items.map((item) => (
                  <article
                    key={item.productId}
                    className="flex items-start justify-between gap-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>

                      <p className="mt-1 text-sm text-stone-500">
                        {item.quantity} × {formatRupiah(item.unitPrice)}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      {formatRupiah(item.subtotal)}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-3 border-t border-stone-200 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-stone-500">Total Pesanan</span>

                  <span className="text-2xl font-bold tracking-tight text-[#245c43]">
                    {formatRupiah(Number(order.total_amount))}
                  </span>
                </div>

                <p className="mt-2 text-right text-xs text-stone-500">
                  Pembayaran dilakukan sesuai prosedur restoran.
                </p>
              </div>
            </section>

            {/* Notes */}
            {order.notes.trim() !== "" && (
              <section className="mt-6 rounded-2xl bg-[#eef2e9] p-4">
                <h2 className="text-sm font-semibold">Catatan Pesanan</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">
                  {order.notes}
                </p>
              </section>
            )}

            {/* Actions */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-[#245c43] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#193f2e]"
              >
                Kembali ke Menu
              </Link>

              <button
                type="button"
                onClick={undefined}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Pesanan Tersimpan
              </button>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-stone-400">
              Simpan nomor pesananmu jika ingin menanyakannya kepada petugas.
              <br />
              SelfOrder · Good food, good moments.
            </p>
          </div>
        </section>

        <footer className="py-6 text-center text-xs text-stone-400">
          © 2026 SelfOrder
        </footer>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage({ params }: OrderPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-4 text-[#24251f]">
          <div className="rounded-2xl border border-stone-200 bg-white px-8 py-6 text-center shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-[#245c43]" />
            <p className="text-sm font-semibold">Memuat detail pesanan...</p>
            <p className="mt-1 text-xs text-stone-500">
              Mohon tunggu sebentar.
            </p>
          </div>
        </main>
      }
    >
      <OrderConfirmationContent params={params} />
    </Suspense>
  );
}
