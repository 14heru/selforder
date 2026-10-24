import "server-only";

import { db } from "@/lib/db";
import type { Product } from "@/data/products";

export type MenuData = {
  categories: string[];
  products: Product[];
};

type CategoryRow = {
  name: string;
};

type ProductRow = {
  id: string | number;
  name: string;
  description: string | null;
  price: string | number;
  category: string;
  emoji: string;
  color: string;
  popular: boolean;
};

const allowedCategories = ["Kopi", "Non-Kopi", "Makanan", "Dessert"] as const;

type MenuCategory = (typeof allowedCategories)[number];

function isMenuCategory(value: string): value is MenuCategory {
  return allowedCategories.some((category) => category === value);
}

function toSafeInteger(value: string | number, field: string): number {
  const numberValue = Number(value);

  if (!Number.isSafeInteger(numberValue) || numberValue < 0) {
    throw new Error(`Nilai ${field} dari database tidak valid.`);
  }

  return numberValue;
}

export async function getMenuData(): Promise<MenuData> {
  const [categoryResult, productResult] = await Promise.all([
    db.query<CategoryRow>(
      `SELECT name
       FROM categories
       ORDER BY id ASC`,
    ),
    db.query<ProductRow>(
      `SELECT
         p.id,
         p.name,
         p.description,
         p.price,
         p.emoji,
         p.color,
         p.is_popular AS popular,
         c.name AS category
       FROM products AS p
       INNER JOIN categories AS c ON c.id = p.category_id
       WHERE p.is_available = TRUE
       ORDER BY p.id ASC`,
    ),
  ]);

  const categoriesFromDb = categoryResult.rows.map((row) => row.name);

  for (const category of categoriesFromDb) {
    if (!isMenuCategory(category)) {
      throw new Error("Database memiliki kategori yang belum didukung UI.");
    }
  }

  const products: Product[] = productResult.rows.map((row) => {
    if (!isMenuCategory(row.category)) {
      throw new Error("Produk memiliki kategori yang belum didukung UI.");
    }

    return {
      id: toSafeInteger(row.id, "id produk"),
      name: row.name,
      description: row.description ?? "",
      price: toSafeInteger(row.price, "harga"),
      category: row.category,
      emoji: row.emoji,
      color: row.color,
      popular: row.popular,
    };
  });

  return {
    categories: ["Semua", ...categoriesFromDb],
    products,
  };
}
