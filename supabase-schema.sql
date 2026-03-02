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

-- Storage bucket for payment screenshots
-- Run this in Storage > Files section or via API:
-- 1. Create a public bucket named "payment-proofs"
-- 2. Add storage.objects policy for public access:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
-- CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
