-- ARTINOVA SQL Schema
-- Use this file to set up your Supabase database. Run these queries in the SQL Editor of your Supabase project.

-- Create profiles/users table that links to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}'::TEXT[], -- Array of image URLs
  stock INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest checkout if guest flows bypass register, but here we require login before checkout.
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  status TEXT DEFAULT 'Order received' NOT NULL, -- 'Order received', 'Crafting in progress', 'Quality check', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'
  total_amount DECIMAL(10, 2) NOT NULL,
  screenshot_url TEXT, -- Uploaded payment screenshot
  delivery_estimate TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Cart Items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Tracking updates history table
CREATE TABLE IF NOT EXISTS public.tracking_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  comment TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) or public access
-- For testing/setup ease, we'll configure simple public read/write or default policies, or since it's an application, we'll write standard API calls that bypass or adapt.
-- You can run policies based on your security needs, or disable RLS for faster prototype setup.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_updates ENABLE ROW LEVEL SECURITY;

-- Enable public read for products
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

-- Enable read for authenticated users on their profile
CREATE POLICY "Allow individual read/write access to profiles" ON public.users 
  FOR ALL USING (auth.uid() = id);

-- Enable read/write access to user's own cart
CREATE POLICY "Allow individual read/write access to cart" ON public.cart_items 
  FOR ALL USING (auth.uid() = user_id);

-- Enable read/write access to user's own wishlist
CREATE POLICY "Allow individual read/write access to wishlist" ON public.wishlist 
  FOR ALL USING (auth.uid() = user_id);

-- Enable read/write access to user's own orders
CREATE POLICY "Allow individual read/write access to orders" ON public.orders 
  FOR ALL USING (auth.uid() = user_id OR (SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0);

-- Enable read/write access to order items
CREATE POLICY "Allow access to order items" ON public.order_items 
  FOR ALL USING (
    (SELECT count(*) FROM public.orders WHERE id = order_id AND user_id = auth.uid()) > 0 
    OR (SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0
  );

-- Enable admin access to everything
CREATE POLICY "Allow admin full access to admin_users" ON public.admin_users FOR ALL USING ((SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0);
CREATE POLICY "Allow admin full access to products" ON public.products FOR ALL USING ((SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0);
CREATE POLICY "Allow admin full access to tracking_updates" ON public.tracking_updates FOR ALL USING (true);
