-- ARTINOVA SQL Schema V2
-- Run this script in the Supabase SQL Editor to initialize your database structure.

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0
);

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  banner_url TEXT,
  is_featured BOOLEAN DEFAULT false
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
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
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

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
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid()
    ) OR 
    (
      SELECT email FROM auth.users 
      WHERE id = auth.uid()
    ) IN ('deepaksabari28@gmail.com', 'akashselva18@gmail.com')
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

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

-- Admin Users: Only admin users see/edit
CREATE POLICY "Admin users policy" ON public.admin_users FOR ALL USING (
  (auth.jwt() ->> 'email') IN ('deepaksabari28@gmail.com', 'akashselva18@gmail.com')
);

-- Settings: Public select, Admin write
CREATE POLICY "Settings read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings write" ON public.settings FOR ALL USING (public.is_admin());

-- Contact Requests: Anyone insert, Admin read
CREATE POLICY "Contact insert" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Contact read" ON public.contact_requests FOR SELECT USING (public.is_admin());
