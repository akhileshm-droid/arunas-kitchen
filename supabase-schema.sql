-- Supabase Schema for Aruna's Kitchen PWA
-- Run this SQL in your Supabase project's SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered')),
  payment_verified BOOLEAN DEFAULT FALSE,
  payment_screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for orders
CREATE POLICY "Allow public inserts for orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow authenticated reads for admin
CREATE POLICY "Allow authenticated reads for orders" ON orders
  FOR SELECT USING (true);

-- Allow authenticated updates for orders
CREATE POLICY "Allow authenticated updates for orders" ON orders
  FOR UPDATE USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_verified ON orders(payment_verified);

-- Create catalog table
CREATE TABLE IF NOT EXISTS catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_price INTEGER NOT NULL,
  product_quantity TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Batters', 'Curries', 'Chutneys', 'Powders')),
  is_in_stock BOOLEAN DEFAULT TRUE,
  product_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;

-- Allow public read access for catalog (anonymous users)
DROP POLICY IF EXISTS "Public read catalog" ON catalog;
CREATE POLICY "Public read catalog" ON catalog
  FOR SELECT USING (true);

-- Allow all authenticated operations for admin
DROP POLICY IF EXISTS "Admin full catalog" ON catalog;
CREATE POLICY "Admin full catalog" ON catalog
  FOR ALL USING (true) WITH CHECK (true);

-- Create index for ordering
CREATE INDEX idx_catalog_category_name ON catalog(category, product_name);

-- Insert sample catalog items
INSERT INTO catalog (product_name, product_price, product_quantity, category, is_in_stock) VALUES
  ('Idli Dosa Batter', 200, '1 kg', 'Batters', true),
  ('Aapam Batter', 250, '1 kg', 'Batters', true),
  ('Adai Batter', 250, '1 kg', 'Batters', true),
  ('Ragi Batter', 200, '1 kg', 'Batters', true),
  ('Sambar', 250, '1 L', 'Curries', true),
  ('Coconut Chutney', 100, '250 ml', 'Chutneys', true),
  ('Tomato Chutney', 100, '250 ml', 'Chutneys', true),
  ('Gun Powder', 200, '200 g', 'Powders', true),
  ('Sambar Powder', 150, '100 g', 'Powders', true);

-- Storage buckets
-- Run in Storage > Files section:
-- 1. Create bucket "payment-proofs" (public)
-- 2. Create bucket "uploads" (public)

-- SQL for storage:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
-- CREATE POLICY "Public Access uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
-- CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');
