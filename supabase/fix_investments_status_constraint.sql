-- Standalone Supabase migration script to allow withdraw_pending status on investments
-- Run this SQL in the Supabase SQL editor (Database → New query) or via your migration tooling.

BEGIN;

-- Update the investments.status constraint to allow `withdraw_pending`
ALTER TABLE public.investments
  ALTER COLUMN status SET DEFAULT 'pending';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'investments'
      AND constraint_type = 'CHECK'
      AND constraint_name = 'investments_status_check'
  ) THEN
    ALTER TABLE public.investments DROP CONSTRAINT investments_status_check;
  END IF;

  ALTER TABLE public.investments
    ADD CONSTRAINT investments_status_check
    CHECK (status in ('pending','active','completed','claimed','withdraw_pending','withdraw_under_review'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

COMMIT;
