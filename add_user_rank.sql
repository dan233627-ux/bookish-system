-- Add `user_rank` column, backfill from legacy `rank`, set defaults, and create index
-- Run in Supabase SQL editor (Database → New query) or via migration tooling.

begin;

alter table public.profiles add column if not exists user_rank text;

-- If a legacy `rank` column exists, copy values into user_rank
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'rank'
  ) THEN
    UPDATE public.profiles
    SET user_rank = rank
    WHERE user_rank IS NULL AND rank IS NOT NULL;
  END IF;
END
$$;

-- Ensure no nulls: set a sensible default for existing rows
UPDATE public.profiles SET user_rank = 'Bronze' WHERE user_rank IS NULL;

-- Optional: create index to speed lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_rank ON public.profiles(user_rank);

-- Optional: set default for future inserts
ALTER TABLE public.profiles ALTER COLUMN user_rank SET DEFAULT 'Bronze';

commit;
