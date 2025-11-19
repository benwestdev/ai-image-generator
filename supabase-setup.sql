-- Supabase Database Setup for AI Image Generator
-- Run this SQL in your Supabase SQL Editor

-- Create the images table
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_gallery BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on order_index for better query performance
CREATE INDEX IF NOT EXISTS idx_images_order ON images(order_index);
CREATE INDEX IF NOT EXISTS idx_images_gallery ON images(is_gallery);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations
-- Note: Adjust this based on your authentication needs
CREATE POLICY "Enable all access for images" ON images
  FOR ALL
  USING (true)
  WITH CHECK (true);
