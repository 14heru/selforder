import { Suspense } from "react";
import { notFound } from "next/navigation";
import MenuClient from "@/app/menu-client";
import { getMenuData } from "@/lib/products";
import { getActiveTableByQrToken } from "@/lib/tables";

type MenuPageProps = {
  params: Promise<{ token: string }>;
};

function MenuLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Memuat menu meja...</p>
    </main>
  );
}

export default function TableMenuPage({ params }: MenuPageProps) {
  return (
    <Suspense fallback={<MenuLoading />}>
      <TableMenuContent params={params} />
    </Suspense>
  );
}

async function TableMenuContent({ params }: MenuPageProps) {
  const { token } = await params;

  const table = await getActiveTableByQrToken(token);

  if (!table) {
    notFound();
  }

  const { categories, products } = await getMenuData();

  return (
    <MenuClient
      categories={categories}
      products={products}
      tableNumber={table.tableNumber}
      qrToken={token}
    />
  );
}
