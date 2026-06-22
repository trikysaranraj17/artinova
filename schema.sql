-- ARTINOVA SQL Schema V2
-- Run this script in the Supabase SQL Editor to initialize your database structure.

-- Safe migrations to convert categories.id and collections.id from UUID to TEXT
-- to match the frontend hardcoded values.
DO $$ 
BEGIN
  -- 1. Drop foreign key constraints first to allow altering primary key types
  ALTER TABLE IF EXISTS public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
  ALTER TABLE IF EXISTS public.product_collections DROP CONSTRAINT IF EXISTS product_collections_collection_id_fkey;

  -- 2. Alter column types to TEXT if they are still UUID
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.categories ALTER COLUMN id TYPE TEXT;
    ALTER TABLE public.categories ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE public.collections ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.collections ALTER COLUMN id TYPE TEXT;
    ALTER TABLE public.collections ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;

  -- Ensure category_id column exists on products table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
    ALTER TABLE public.products ADD COLUMN category_id TEXT;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id' AND data_type = 'uuid') THEN
    ALTER TABLE public.products ALTER COLUMN category_id TYPE TEXT;
  END IF;

  -- Ensure collection_id column exists on product_collections table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_collections' AND column_name = 'collection_id') THEN
    ALTER TABLE public.product_collections ADD COLUMN collection_id TEXT;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_collections' AND column_name = 'collection_id' AND data_type = 'uuid') THEN
    ALTER TABLE public.product_collections ALTER COLUMN collection_id TYPE TEXT;
  END IF;

  -- 3. Recreate foreign key constraints
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_category_id_fkey') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_collections_collection_id_fkey') THEN
    ALTER TABLE public.product_collections ADD CONSTRAINT product_collections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT, -- Home, Work, etc.
  full_name TEXT,
  phone TEXT,
  line1 TEXT,
  line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0
);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  banner_url TEXT,
  is_featured BOOLEAN DEFAULT false
);
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  stock INT DEFAULT 0,
  is_customizable BOOLEAN DEFAULT false,
  customization_fields JSONB DEFAULT '[]'::JSONB,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_customizable BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS customization_fields JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 6. PRODUCT_IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- 7. PRODUCT_COLLECTIONS (junction)
CREATE TABLE IF NOT EXISTS public.product_collections (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id TEXT REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);
ALTER TABLE public.product_collections ADD COLUMN IF NOT EXISTS collection_id TEXT;

-- 8. CART_ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  customization JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 10. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- e.g. "ART-2025-XXXXX"
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  gst DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  gift_note TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending | verified | rejected
  order_status TEXT DEFAULT 'received', -- received | verified | design | crafting | quality | packaging | shipped | delivered
  payment_screenshot_url TEXT,
  tracking_number TEXT,
  courier TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'received';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 11. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  customization JSONB DEFAULT '{}'::JSONB
);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS customization JSONB DEFAULT '{}'::JSONB;

-- 12. TRACKING_UPDATES
CREATE TABLE IF NOT EXISTS public.tracking_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  note TEXT,
  updated_by UUID, -- admin profile ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ADMIN_USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS name TEXT;

-- 15. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- 16. CONTACT_REQUESTS
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  type TEXT DEFAULT 'general', -- general | corporate | custom
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.contact_requests ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Setup Admin check function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'email') IN ('deepaksabari28@gmail.com', 'akashselva18@gmail.com', 'deepaksabari28@gmial.com')
    OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- Drop all existing policies on public schema tables dynamically to clear duplicate/legacy recursive policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Profiles: Users see/edit own, Admins see all
CREATE POLICY "Profiles view" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Addresses: Users own
CREATE POLICY "Addresses owner" ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Categories: Public read, Admin write
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories admin write" ON public.categories FOR ALL USING (public.is_admin());

-- Collections: Public read, Admin write
CREATE POLICY "Collections public read" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Collections admin write" ON public.collections FOR ALL USING (public.is_admin());

-- Products: Public read active, Admin write/read all
CREATE POLICY "Products public read" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Products admin write" ON public.products FOR ALL USING (public.is_admin());

-- Product Images: Public read, Admin write
CREATE POLICY "Product images read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product images admin write" ON public.product_images FOR ALL USING (public.is_admin());

-- Product Collections junction: Public read, Admin write
CREATE POLICY "Product collections read" ON public.product_collections FOR SELECT USING (true);
CREATE POLICY "Product collections admin write" ON public.product_collections FOR ALL USING (public.is_admin());

-- Cart Items: User own
CREATE POLICY "Cart owner" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Wishlist: User own
CREATE POLICY "Wishlist owner" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Orders: User see own, Admin full access
CREATE POLICY "Orders select" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Orders write" ON public.orders FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Order Items: User see own, Admin full
CREATE POLICY "Order items select" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Order items write" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR public.is_admin()
);

-- Tracking updates: Public select, Admin write
CREATE POLICY "Tracking read" ON public.tracking_updates FOR SELECT USING (true);
CREATE POLICY "Tracking write" ON public.tracking_updates FOR ALL USING (public.is_admin());

-- Reviews: Public select, Authenticated write
CREATE POLICY "Reviews read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviews write" ON public.reviews FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Admin Users: Anyone can view their own record, or the main admins can view all (Recursion-proof)
CREATE POLICY "Admin users select own" ON public.admin_users FOR SELECT USING (
  auth.uid() = user_id 
  OR 
  (auth.jwt() ->> 'email') IN ('deepaksabari28@gmail.com', 'akashselva18@gmail.com', 'deepaksabari28@gmial.com')
);

-- Admin Users modifications: Only main admins or existing admins can modify
CREATE POLICY "Admin users admin access" ON public.admin_users FOR ALL USING (
  (auth.jwt() ->> 'email') IN ('deepaksabari28@gmail.com', 'akashselva18@gmail.com', 'deepaksabari28@gmial.com')
  OR
  public.is_admin()
);

-- Settings: Public select, Admin write
CREATE POLICY "Settings read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings write" ON public.settings FOR ALL USING (public.is_admin());

-- Contact Requests: Anyone insert, Admin read
CREATE POLICY "Contact insert" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Contact read" ON public.contact_requests FOR SELECT USING (public.is_admin());

-- Seed data for Categories
INSERT INTO public.categories (id, name, slug, display_order)
VALUES 
  ('cat-frames', 'Luxury Frames', 'luxury-frames', 1),
  ('cat-hampers', 'Premium Hampers', 'premium-hampers', 2),
  ('cat-art', 'Resin Art Masterpieces', 'resin-art-masterpieces', 3),
  ('cat-accessories', 'Custom Accessories', 'custom-accessories', 4),
  ('cat-keepsakes', 'Bespoke Keepsakes', 'bespoke-keepsakes', 5)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  display_order = EXCLUDED.display_order;

-- Seed data for Collections
INSERT INTO public.collections (id, name, slug, description, is_featured)
VALUES 
  ('col-wedding', 'Wedding Gifts', 'wedding-gifts', 'Curated royal wedding gifts and customized couples coordinates.', true),
  ('col-couple', 'Couple Gifts', 'couple-gifts', 'Handcrafted items to celebrate unions, engagements, and anniversaries.', true),
  ('col-birthday', 'Birthday Gifts', 'birthday-gifts', 'Unique personalized keepsakes that make birthdays unforgettable.', false),
  ('col-corporate', 'Corporate Gifts', 'corporate-gifts', 'White-label luxury executive presentation sets for brands.', true),
  ('col-photo', 'Photo Gifts', 'photo-gifts', 'Turn frozen visual memories into physical gold-leafed glass frames.', false),
  ('col-resin', 'Resin Art', 'resin-art', 'Indulge in liquid-gold resin geodes and bespoke preservation pieces.', true),
  ('col-hampers', 'Luxury Hampers', 'luxury-hampers', 'Grand gift trunks containing fine sandlewood and custom keepsakes.', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  is_featured = EXCLUDED.is_featured;
