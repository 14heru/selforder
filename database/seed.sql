
-- =========================================================
-- SelfOrder: Initial Seed Data
-- PostgreSQL 18
-- =========================================================

BEGIN;

-- 1. Kategori menu
INSERT INTO categories (name)
VALUES
    ('Kopi'),
    ('Non-Kopi'),
    ('Makanan'),
    ('Dessert')
ON CONFLICT (name) DO NOTHING;

-- 2. Produk menu
INSERT INTO products (
    category_id,
    name,
    description,
    price,
    emoji,
    color,
    is_popular,
    is_available
)
VALUES
    (
        (SELECT id FROM categories WHERE name = 'Kopi'),
        'Iced Aren Latte',
        'Espresso, susu segar, gula aren',
        24000,
        '☕',
        'from-amber-100 to-orange-200',
        TRUE,
        TRUE
    ),
    (
        (SELECT id FROM categories WHERE name = 'Kopi'),
        'Cappuccino',
        'Espresso dengan foam susu lembut',
        22000,
        '🥛',
        'from-stone-100 to-amber-200',
        FALSE,
        TRUE
    ),
    (
        (SELECT id FROM categories WHERE name = 'Non-Kopi'),
        'Matcha Latte',
        'Matcha pilihan dengan susu segar',
        26000,
        '🍵',
        'from-lime-100 to-green-200',
        TRUE,
        TRUE
    ),
    (
        (SELECT id FROM categories WHERE name = 'Non-Kopi'),
        'Chocolate Frappe',
        'Cokelat creamy dengan es',
        28000,
        '🍫',
        'from-orange-100 to-amber-200',
        FALSE,
        TRUE
    ),
    (
        (SELECT id FROM categories WHERE name = 'Makanan'),
        'Chicken Rice Bowl',
        'Ayam berbumbu dengan nasi hangat',
        32000,
        '🍛',
        'from-yellow-100 to-orange-200',
        TRUE,
        TRUE
    ),
    (
        (SELECT id FROM categories WHERE name = 'Makanan'),
        'French Fries',
        'Kentang goreng renyah',
        18000,
        '🍟',
        'from-yellow-100 to-amber-200',
        FALSE,
        TRUE
    ),
    (
        (SELECT id FROM categories WHERE name = 'Dessert'),
        'Classic Croissant',
        'Pastry renyah dengan mentega',
        20000,
        '🥐',
        'from-rose-100 to-orange-200',
        TRUE,
        TRUE
    )
ON CONFLICT DO NOTHING;

COMMIT;
