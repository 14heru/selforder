export const categories = [
  "Semua",
  "Kopi",
  "Non-Kopi",
  "Makanan",
  "Dessert",
] as const;

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Exclude<(typeof categories)[number], "Semua">;
  emoji: string;
  color: string;
  popular: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Iced Aren Latte",
    description: "Espresso, susu segar, gula aren",
    price: 24000,
    category: "Kopi",
    emoji: "☕",
    color: "from-amber-100 to-orange-200",
    popular: true,
  },
  {
    id: 2,
    name: "Cappuccino",
    description: "Espresso dengan foam susu lembut",
    price: 22000,
    category: "Kopi",
    emoji: "🥛",
    color: "from-stone-100 to-amber-200",
    popular: false,
  },
  {
    id: 3,
    name: "Matcha Latte",
    description: "Matcha pilihan dengan susu segar",
    price: 26000,
    category: "Non-Kopi",
    emoji: "🍵",
    color: "from-lime-100 to-green-200",
    popular: true,
  },
  {
    id: 4,
    name: "Chocolate Frappe",
    description: "Cokelat creamy dengan es",
    price: 28000,
    category: "Non-Kopi",
    emoji: "🍫",
    color: "from-orange-100 to-amber-200",
    popular: false,
  },
  {
    id: 5,
    name: "Chicken Rice Bowl",
    description: "Ayam berbumbu dengan nasi hangat",
    price: 32000,
    category: "Makanan",
    emoji: "🍛",
    color: "from-yellow-100 to-orange-200",
    popular: true,
  },
  {
    id: 6,
    name: "French Fries",
    description: "Kentang goreng renyah",
    price: 18000,
    category: "Makanan",
    emoji: "🍟",
    color: "from-yellow-100 to-amber-200",
    popular: false,
  },
  {
    id: 7,
    name: "Classic Croissant",
    description: "Pastry renyah dengan mentega",
    price: 20000,
    category: "Dessert",
    emoji: "🥐",
    color: "from-rose-100 to-orange-200",
    popular: true,
  },
];
