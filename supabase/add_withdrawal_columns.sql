-- Add missing withdrawal columns to investments for fee proof and payout wallet persistence
-- Run this in the Supabase SQL editor or via your migration tooling.

BEGIN;

ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS withdrawal_fee_currency text check (withdrawal_fee_currency in ('TRX','USDT','BTC','ETH')),
  ADD COLUMN IF NOT EXISTS payout_wallet_address text;

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
