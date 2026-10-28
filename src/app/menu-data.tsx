import MenuClient from "@/app/menu-client";
import { getMenuData } from "@/lib/products";
import { getActiveTableByQrToken } from "@/lib/tables";

type MenuDataProps = {
  searchParams: Promise<{
    qr?: string | string[];
  }>;
};

export default async function MenuData({ searchParams }: MenuDataProps) {
  const [{ categories, products }, params] = await Promise.all([
    getMenuData(),
    searchParams,
  ]);

  const qrValue = params.qr;
  const qrToken = Array.isArray(qrValue) ? qrValue[0] : qrValue;

  const table = qrToken ? await getActiveTableByQrToken(qrToken) : null;

  return (
    <MenuClient
      categories={categories}
      products={products}
      qrToken={table ? qrToken : undefined}
      tableNumber={table?.tableNumber}
    />
  );
}
