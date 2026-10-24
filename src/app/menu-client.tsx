"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";

type MenuClientProps = {
  categories: string[];
  products: Product[];
};

const formatRupiah = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

export default function MenuClient({ categories, products }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Semua" || product.category === activeCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, products]);

  const cartItems = products.filter((product) => (cart[product.id] ?? 0) > 0);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const cartTotal = cartItems.reduce(
    (total, product) => total + product.price * (cart[product.id] ?? 0),
    0,
  );

  function updateCart(productId: number, change: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] ?? 0) + change;
      const next = { ...current };

      if (nextQuantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = nextQuantity;
      }

      return next;
    });
  }

  async function handleCheckout() {
    if (isCheckingOut || cartItems.length === 0) {
      return;
    }

    setIsCheckingOut(true);
    setCheckoutMessage("");
    setCheckoutError(false);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: 1,
          items: cartItems.map((product) => ({
            productId: product.id,
            quantity: cart[product.id] ?? 0,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Pesanan gagal dikirim ke server.");
      }

      setCheckoutMessage(
        `Pesanan berhasil dibuat! Nomor pesanan: ${result.order.orderNumber}`,
      );
      setCart({});
    } catch (error) {
      setCheckoutError(true);
      setCheckoutMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat pesanan.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] pb-28 text-[#24251f]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#faf9f6]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#245c43] text-xl text-white">
              S
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">selforder</p>
              <p className="text-[11px] tracking-wide text-stone-500">
                GOOD FOOD, GOOD MOOD
              </p>
            </div>
          </a>

          <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2.5">
            <span aria-hidden="true">⌖</span>
            <div>
              <p className="text-[10px] text-stone-500">MEJA ANDA</p>
              <p className="text-sm font-semibold">Meja 01</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Hero */}
        <section className="relative mt-6 overflow-hidden rounded-[28px] bg-[#214e39] px-6 py-9 text-white sm:mt-8 sm:px-10 sm:py-12 lg:py-14">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
              ✦ Freshly made, just for you
            </span>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Your table,
              <br />
              your favorites.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
              Santai, pilih menu favoritmu. Kami siapkan dengan sepenuh hati.
            </p>

            <a
              href="#menu"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e9f0d7] px-5 py-3 text-sm font-semibold text-[#214e39] transition hover:bg-white"
            >
              Jelajahi menu <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 h-64 w-64 rounded-full border border-white/10 sm:right-8 sm:top-0 sm:h-80 sm:w-80"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 top-8 flex h-44 w-44 rotate-6 items-center justify-center rounded-full bg-[#e6d5b8] text-7xl shadow-2xl sm:right-16 sm:top-10 sm:h-60 sm:w-60 sm:text-8xl"
          >
            ☕
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-[#8ea17a]/20 blur-2xl"
          />
        </section>

        {/* Menu heading */}
        <section id="menu" className="scroll-mt-28 pt-10 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64836a]">
                Made with love
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Temukan favoritmu
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Pilih menu, pesan langsung dari meja kamu.
              </p>
            </div>

            <div className="hidden rounded-full bg-[#e8eee3] px-4 py-2 text-xs font-medium text-[#315b3e] sm:block">
              ✦ Menu pilihan hari ini
            </div>
          </div>

          {/* Search */}
          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 transition focus-within:border-[#6e9274] focus-within:ring-2 focus-within:ring-[#6e9274]/15">
            <span aria-hidden="true" className="text-lg text-stone-400">
              ⌕
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kopi, makanan, atau favoritmu..."
              aria-label="Cari menu"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-stone-500 hover:text-stone-900"
                aria-label="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  activeCategory === category
                    ? "bg-[#245c43] text-white shadow-sm"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-[#245c43] hover:text-[#245c43]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="mt-7 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Menu untukmu</h3>
            <p className="text-xs text-stone-500">
              {filteredProducts.length} menu
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/60"
                >
                  <div
                    className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.color}`}
                  >
                    <span
                      role="img"
                      aria-label={product.name}
                      className="select-none text-6xl transition duration-300 group-hover:scale-110 sm:text-7xl"
                    >
                      {product.emoji}
                    </span>

                    {product.popular && (
                      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#315b3e] shadow-sm sm:left-3 sm:top-3 sm:text-xs">
                        ★ Favorit
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#64836a]">
                      {product.category}
                    </p>
                    <h4 className="mt-1.5 line-clamp-1 text-sm font-semibold sm:text-base">
                      {product.name}
                    </h4>
                    <p className="mt-1.5 min-h-9 text-xs leading-4 text-stone-500">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold sm:text-sm">
                        {formatRupiah(product.price)}
                      </p>

                      {(cart[product.id] ?? 0) === 0 ? (
                        <button
                          onClick={() => updateCart(product.id, 1)}
                          aria-label={`Tambah ${product.name}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#245c43] text-xl text-white transition hover:bg-[#193f2e] active:scale-95"
                        >
                          +
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCart(product.id, -1)}
                            aria-label={`Kurangi ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:bg-stone-100"
                          >
                            −
                          </button>
                          <span className="min-w-4 text-center text-sm font-semibold">
                            {cart[product.id]}
                          </span>
                          <button
                            onClick={() => updateCart(product.id, 1)}
                            aria-label={`Tambah ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#245c43] text-lg text-white hover:bg-[#193f2e]"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-14 text-center">
              <p className="text-3xl">🔎</p>
              <p className="mt-3 font-semibold">Menu tidak ditemukan</p>
              <p className="mt-1 text-sm text-stone-500">
                Coba kata kunci atau kategori yang lain.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Semua");
                }}
                className="mt-4 text-sm font-semibold text-[#245c43] hover:underline"
              >
                Lihat semua menu
              </button>
            </div>
          )}
        </section>

        {/* Information */}
        <section className="mt-12 rounded-2xl border border-[#dfe6d9] bg-[#eef2e9] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
          <div>
            <p className="font-semibold">Dibuat khusus untuk kamu.</p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Pesan dari meja, nikmati waktu tanpa terburu-buru.
            </p>
          </div>
          <p className="mt-3 text-xs text-stone-500 sm:mt-0">
            SelfOrder · Demo menu
          </p>
        </section>

        <footer className="py-8 text-center text-xs text-stone-400">
          © 2026 Heru Perdana Saputra SelfOrder. Good food, good moments.
        </footer>
      </div>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-stone-500">
                {cartCount} item dalam keranjang
              </p>
              <p className="mt-0.5 text-base font-bold">
                {formatRupiah(cartTotal)}
              </p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-3 rounded-2xl bg-[#245c43] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#193f2e]"
            >
              <span>Keranjang</span>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/15 px-1.5 text-xs">
                {cartCount}
              </span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-5"
          onClick={() => setShowCart(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#faf9f6] p-5 sm:rounded-3xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 id="cart-title" className="text-xl font-bold">
                  Keranjang kamu
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Meja 01 · {cartCount} item
                </p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                aria-label="Tutup keranjang"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {cartItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3"
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${product.color} text-3xl`}
                  >
                    {product.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {formatRupiah(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCart(product.id, -1)}
                      aria-label={`Kurangi ${product.name}`}
                      className="h-8 w-8 rounded-lg border border-stone-200"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold">
                      {cart[product.id]}
                    </span>
                    <button
                      onClick={() => updateCart(product.id, 1)}
                      aria-label={`Tambah ${product.name}`}
                      className="h-8 w-8 rounded-lg bg-[#245c43] text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">
                  Subtotal (belum termasuk biaya tambahan)
                </span>
                <span className="text-lg font-bold">
                  {formatRupiah(cartTotal)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
                className="mt-5 w-full rounded-2xl bg-[#245c43] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#193f2e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut
                  ? "Memproses pesanan..."
                  : "Lanjut ke checkout →"}
              </button>

              {checkoutMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-3 text-center text-xs ${
                    checkoutError ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {checkoutMessage}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
