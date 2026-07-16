-- Migration: Create Supabase storage bucket for deposit screenshot uploads
-- Run this SQL in the Supabase SQL editor or via supabase migration tooling.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE name = 'deposit-screenshots'
  ) THEN
    PERFORM storage.create_bucket('deposit-screenshots', true);
  END IF;
END
$$;

-- If your Supabase project requires a different bucket name, change the bucket name in the query above.
-- This bucket is intended for public screenshot URLs used in Telegram notifications and admin review.
