-- =====================================================================
-- Kiswah Collection — Supabase PostgreSQL Schema Script
-- Run this in the Supabase Dashboard: SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_pkr NUMERIC(10, 2) NOT NULL,
    volume VARCHAR(50) DEFAULT '100ml',
    top_notes VARCHAR(255),
    heart_notes VARCHAR(255),
    base_notes VARCHAR(255),
    image_url VARCHAR(500),
    stock INTEGER DEFAULT 50 NOT NULL,
    description TEXT,
    longevity INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    items_json TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD' NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes for Faster Queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 4. Enable Row Level Security (RLS) & Allow Anonymous Read/Insert for Storefront
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products
CREATE POLICY "Public products read access" ON public.products
    FOR SELECT USING (true);

-- Allow anyone to place an order
CREATE POLICY "Public orders insert access" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users / service role full access
CREATE POLICY "Authenticated orders read access" ON public.orders
    FOR SELECT TO authenticated USING (true);
