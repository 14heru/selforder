"use client";

import { useState } from "react";

type CopyOrderNumberButtonProps = {
  orderNumber: string;
};

export default function CopyOrderNumberButton({
  orderNumber,
}: CopyOrderNumberButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function handleCopy() {
    setCopied(false);
    setError(false);

    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setError(true);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
      >
        {copied ? "Nomor Berhasil Disalin ✓" : "Salin Nomor Pesanan"}
      </button>

      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          Nomor gagal disalin. Silakan salin nomor pesanan secara manual.
        </p>
      )}
    </div>
  );
}
