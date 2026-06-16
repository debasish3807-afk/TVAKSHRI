-- ============================================================
-- TVAKSHRI Ecommerce — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  tagline       text not null default '',
  description   text not null default '',
  long_description text not null default '',
  price         numeric(10,2) not null,
  original_price numeric(10,2),
  images        text[] not null default '{}',
  category      text not null default 'Face Pack',
  tags          text[] not null default '{}',
  ingredients   text[] not null default '{}',
  benefits      text[] not null default '{}',
  how_to_use    text[] not null default '{}',
  skin_type     text[] not null default '{}',
  weight        text not null default '100g',
  in_stock      boolean not null default true,
  stock_count   integer not null default 0,
  rating        numeric(3,2) not null default 0,
  review_count  integer not null default 0,
  is_bestseller boolean not null default false,
  is_new        boolean not null default false,
  accent_color  text not null default '#C9A84C',
  bg_color      text not null default '#FFF8F0',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
create table if not exists public.orders (
  id               text primary key,
  user_session     text not null,
  items            jsonb not null,
  subtotal         numeric(10,2) not null,
  shipping_fee     numeric(10,2) not null default 0,
  discount         numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  coupon_code      text,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  shipping_address jsonb not null,
  payment_method   text not null,
  payment_status   text not null default 'paid',
  status           text not null default 'confirmed',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- WISHLIST TABLE
-- ============================================================
create table if not exists public.wishlist (
  id           uuid primary key default gen_random_uuid(),
  user_session text not null,
  product_id   uuid not null references public.products(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (user_session, product_id)
);

-- ============================================================
-- COUPONS TABLE
-- ============================================================
create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  type        text not null check (type in ('percentage','fixed')),
  value       numeric(10,2) not null,
  min_order   numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  description text not null default '',
  active      boolean not null default true,
  usage_count integer not null default 0,
  max_usage   integer,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
create table if not exists public.reviews (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products(id) on delete cascade,
  author_name      text not null,
  rating           integer not null check (rating between 1 and 5),
  title            text not null default '',
  body             text not null,
  verified_purchase boolean not null default false,
  helpful_count    integer not null default 0,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — allow public reads
-- ============================================================
alter table public.products enable row level security;
alter table public.orders   enable row level security;
alter table public.wishlist enable row level security;
alter table public.coupons  enable row level security;
alter table public.reviews  enable row level security;

-- Products: public read
create policy "Public can read products" on public.products for select using (true);
-- Admin write (service key bypasses RLS)
create policy "Service role can manage products" on public.products for all using (true);

-- Orders: anyone can insert; read own session
create policy "Anyone can place orders" on public.orders for insert with check (true);
create policy "Session can read own orders" on public.orders for select using (true);
create policy "Service role can manage orders" on public.orders for update using (true);

-- Wishlist: public read/write by session
create policy "Public wishlist access" on public.wishlist for all using (true);

-- Coupons: public read active only
create policy "Public can read active coupons" on public.coupons for select using (active = true);
create policy "Service role can manage coupons" on public.coupons for all using (true);

-- Reviews: public read; anyone can submit
create policy "Public can read reviews" on public.reviews for select using (true);
create policy "Anyone can submit review" on public.reviews for insert with check (true);

-- ============================================================
-- SEED PRODUCTS
-- ============================================================
insert into public.products (name, slug, tagline, description, long_description, price, original_price, images, category, tags, ingredients, benefits, how_to_use, skin_type, weight, in_stock, stock_count, rating, review_count, is_bestseller, is_new, accent_color, bg_color)
values
(
  'Neem Detox Face Pack',
  'neem-detox-face-pack',
  'Deep purifying detox for clear, balanced skin',
  'Powered by wild-harvested neem, this therapeutic face pack deeply cleanses pores and combats acne-causing bacteria.',
  'Ancient Ayurvedic texts extol neem as "Sarva Roga Nivarini" — the curer of all ailments. Our Neem Detox Face Pack harnesses this time-honoured herb alongside sandalwood and turmeric to deliver deep-pore cleansing action.',
  549, 749,
  array['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'],
  'Face Pack',
  array['acne','oily skin','detox','neem','purifying'],
  array['Neem Leaf Powder','Sandalwood Powder','Turmeric','Tulsi Leaf Powder','Multani Mitti','Kaolin Clay','Lodhra Bark'],
  array['Deep pore cleansing','Reduces acne & blemishes','Controls excess oil','Brightens dull skin','Calms inflammation'],
  array['Mix 1 tsp with rose water','Apply to cleansed face','Leave for 15–20 minutes','Rinse with lukewarm water','Use 2–3 times per week'],
  array['Oily','Combination','Acne-prone','Normal'],
  '100g', true, 48, 4.8, 312, true, false, '#2D6B14', '#F0F7EC'
),
(
  'Haldi Bright Face Pack',
  'haldi-bright-face-pack',
  'Illuminate your radiance with sacred saffron turmeric',
  'A golden blend of Kashmiri saffron, certified organic turmeric and sandalwood that brightens and evens tone.',
  'The golden glow of turmeric has graced Indian beauty rituals for millennia. Our Haldi Bright Face Pack elevates this heritage with Kashmiri saffron strands, organic sandalwood powder and vitamin-rich papaya enzyme.',
  649, 899,
  array['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80','https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80'],
  'Face Pack',
  array['brightening','anti-dark-spots','glow','turmeric','saffron'],
  array['Organic Turmeric','Kashmiri Saffron','Sandalwood Powder','Papaya Enzyme Powder','Rice Flour','Milk Powder','Manjistha Root'],
  array['Brightens & evens skin tone','Fades dark spots','Anti-ageing antioxidants','Imparts golden glow','Smoothens texture'],
  array['Mix with milk or rose water','Apply to clean face','Leave for 15–20 minutes','Rinse with cold water','Use 3 times per week'],
  array['All skin types','Dull skin','Hyperpigmentation','Dry skin'],
  '100g', true, 62, 4.9, 428, true, false, '#E08B00', '#FFF3D6'
),
(
  'Rose Glow Face Pack',
  'rose-glow-face-pack',
  'Petal-soft hydration and rosy luminescence',
  'Distilled from Bulgarian and Damask rose varieties, this luxuriously hydrating pack restores moisture and plumps fine lines.',
  'A symphony of Bulgarian rose petals, Damask rose water and cold-pressed rosehip oil — our Rose Glow Face Pack is a hydrating poem for parched skin.',
  699, 949,
  array['https://images.unsplash.com/photo-1585232352617-e05c95e5e8a2?w=600&q=80','https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80'],
  'Face Pack',
  array['hydrating','glow','anti-ageing','rose','dry skin'],
  array['Dried Damask Rose Petal Powder','Rosehip Oil','Rose Water Powder','Kaolin Clay','Aloe Vera Powder','Hyaluronic Acid Microspheres','Vitamin E'],
  array['Deep hydration','Plumps fine lines','Rosy glow','Soothes sensitive skin','Strengthens moisture barrier'],
  array['Mix with rose water','Apply to face & décolletage','Leave for 20 minutes','Rinse with cool water','Use 2–4 times per week'],
  array['Dry','Normal','Sensitive','Mature skin'],
  '100g', true, 35, 4.7, 276, false, true, '#C94F4F', '#FFF5F5'
),
(
  'Rice Polish Powder',
  'rice-polish-powder',
  'The Japanese-Ayurvedic secret to porcelain perfection',
  'Ultra-fine Japanese-inspired rice bran exfoliant blended with pearl powder for gentle polishing.',
  'Inspired by the centuries-old secret of Japanese rice farmers known for their remarkably smooth skin, our Rice Polish Powder combines ultra-fine rice bran flour with precious pearl powder and natural kojic acid.',
  499, 699,
  array['https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&q=80','https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'],
  'Exfoliant',
  array['exfoliant','brightening','smooth skin','rice','polish'],
  array['Rice Bran Flour','Pearl Powder','Natural Kojic Acid','Licorice Root Extract','Green Tea Powder','Vitamin C Derivatives','Papaya Enzyme'],
  array['Gentle physical exfoliation','Brightens & polishes','Reduces dark spots','Refines pores','Silky-smooth texture'],
  array['Mix with cleanser or water','Apply to damp face','Massage gently in circles','Rinse thoroughly','Use 2 times per week only'],
  array['All skin types','Sensitive','Dull skin'],
  '75g', true, 89, 4.6, 189, false, false, '#8B6E40', '#FFF8F0'
),
(
  'Multani Purify Face Pack',
  'multani-purify-face-pack',
  'Ancient earth clay — pure, powerful, perfecting',
  'Authentic Fuller''s Earth sourced from mineral-rich deposits, blended with Vetiver and Brahmi.',
  'Multani Mitti (Fuller''s Earth) has been a cornerstone of Ayurvedic beauty for over 5,000 years. Our Multani Purify Face Pack uses premium-grade clay enriched with cooling vetiver root, brahmi and detoxifying charcoal.',
  449, 599,
  array['https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&q=80','https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80'],
  'Face Pack',
  array['purifying','oil control','pores','multani mitti','clay'],
  array['Premium Multani Mitti','Vetiver Root Powder','Brahmi Leaf Extract','Activated Charcoal','Camphor','Neem Powder','Tea Tree Leaf Powder'],
  array['Absorbs excess oil','Minimises enlarged pores','Removes blackheads','Cools & refreshes skin','Detoxifies skin cells'],
  array['Mix with chilled rose water','Apply thick even layer','Leave for 15 minutes','Rinse with cold water','Use 1–2 times per week'],
  array['Oily','Combination','Normal','Acne-prone'],
  '100g', true, 73, 4.7, 234, false, false, '#8B6340', '#F5EDE0'
),
(
  'Bridal Glow Ubtan',
  'bridal-glow-ubtan',
  'The royal pre-bridal ritual for luminous, radiant skin',
  'A sacred blend of 21 Ayurvedic ingredients used in royal bridal ceremonies for centuries.',
  'Reserved for brides and special occasions in royal Indian households, Ubtan is the ultimate luxury skincare ritual. Our Bridal Glow Ubtan contains 21 premium Ayurvedic ingredients including Kashmiri saffron, organic chickpea flour, rose petals, sandalwood powder and precious herbs like kumkumadi.',
  849, 1199,
  array['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80','https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80'],
  'Ubtan',
  array['bridal','glow','luxury','ubtan','special occasion','saffron'],
  array['Organic Chickpea Flour','Kashmiri Saffron','Sandalwood Powder','Dried Rose Petals','Turmeric','Kumkumadi Tailam','Lodhra','Manjistha','Amla Powder','Ashwagandha'],
  array['Deep nourishment & glow','Evens & brightens complexion','Natural de-tanning','Luxury fragrance','Full body use possible','21-day transformation ritual'],
  array['Mix 2 tsp with raw milk and almond oil','Apply generously to face and body','Let dry for 20–25 minutes','Scrub gently while rinsing','Use daily 3 weeks before occasion'],
  array['All skin types','Bridal ritual','Special occasions'],
  '150g', true, 28, 4.9, 156, true, false, '#9B0D0D', '#FFE4E4'
);

-- ============================================================
-- SEED COUPONS
-- ============================================================
insert into public.coupons (code, type, value, min_order, max_discount, description, active)
values
  ('TVAK10',    'percentage', 10,  500,  200, '10% off on orders above ₹500', true),
  ('FIRST15',   'percentage', 15,  700,  300, '15% off for first-time customers', true),
  ('BRIDE100',  'fixed',      100, 800,  null, '₹100 off on bridal ritual orders', true),
  ('GLOW200',   'fixed',      200, 1500, null, '₹200 off on orders above ₹1500', true),
  ('WELCOME5',  'percentage', 5,   300,  null, '5% welcome discount', true)
on conflict (code) do nothing;

-- ============================================================
-- SEED SAMPLE REVIEWS
-- ============================================================
insert into public.reviews (product_id, author_name, rating, title, body, verified_purchase)
select p.id, r.author_name, r.rating, r.title, r.body, r.verified_purchase
from public.products p
cross join lateral (
  values
    ('Priya S.',      5, 'Absolutely love this!',    'My skin has never felt this clean. The neem scent is so refreshing.', true),
    ('Meera K.',      4, 'Great for oily skin',      'Visible difference in 2 weeks. Acne has reduced significantly.', true),
    ('Ananya R.',     5, 'Holy grail product',       'I have tried everything. This is the best natural face pack I have used.', false)
) as r(author_name, rating, title, body, verified_purchase)
where p.slug = 'neem-detox-face-pack'
on conflict do nothing;
