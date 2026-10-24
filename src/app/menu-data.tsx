import MenuClient from "@/app/menu-client";
import { getMenuData } from "@/lib/products";

export default async function MenuData() {
  const { categories, products } = await getMenuData();

  return <MenuClient categories={categories} products={products} />;
}
