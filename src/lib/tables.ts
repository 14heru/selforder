import "server-only";

import { db } from "@/lib/db";

type RestaurantTableRow = {
  id: string | number;
  table_number: string;
};

export type RestaurantTable = {
  id: number;
  tableNumber: string;
};

export async function getActiveTableByQrToken(
  token: string,
): Promise<RestaurantTable | null> {
  const normalizedToken = token.trim();

  // Token QR berbentuk UUID. Tolak format yang tidak valid sebelum query.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(normalizedToken)) {
    return null;
  }

  const result = await db.query<RestaurantTableRow>(
    `SELECT id, table_number
     FROM restaurant_tables
     WHERE qr_token = $1::uuid
       AND is_active = TRUE
     LIMIT 1`,
    [normalizedToken],
  );

  const table = result.rows[0];

  if (!table) {
    return null;
  }

  const id = Number(table.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("ID meja dari database tidak valid.");
  }

  return {
    id,
    tableNumber: table.table_number,
  };
}
