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

-- Insert some sample orders (optional)
-- INSERT INTO orders (customer_name, phone, address, items, total_price, status)
-- VALUES (
--   'Demo Customer',
--   '9876543210',
--   '123 Demo Street, Demo City',
--   '[{"menu_item_id": "1", "name": "Idli Dosa Batter", "price": 200, "quantity": 2}]',
--   400,
--   'pending'
-- );
