-- Supabase migration script for Forex Royal
-- Run this in the Supabase SQL editor (Database → New query) or via your migration tooling.
-- It creates `profiles`, `investments`, `transactions`, and `community_comments` tables
-- and the necessary constraints, indexes, and triggers for updated_at management.

-- 1) Ensure extensions (if needed)
-- (Uncomment if your Supabase DB needs extensions)
-- create extension if not exists "pgcrypto";

-- 2) Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_rank text,
  join_date timestamptz,
  trust_score integer default 0,
  base_invested numeric(18,2) default 0,
  base_earnings numeric(18,2) default 0,
  base_withdrawn numeric(18,2) default 0,
  base_completed integer default 0,
  wallet_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_user_rank on public.profiles(user_rank);
create index if not exists idx_profiles_trust_score on public.profiles(trust_score);

-- 3) Investments table (deposits / contracts)
create table if not exists public.investments (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  plan_label text not null,
  category text not null check (category in ('24h','2day','weekly')),
  capital numeric(18,2) not null,
  roi numeric(18,2) not null,
  duration_hours integer not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending','active','completed','claimed')),
  screenshot_url text,
  payment_method text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.investments alter column status set default 'pending';

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
    CHECK (status in ('pending','active','completed','claimed'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

create index if not exists idx_investments_user_id on public.investments(user_id);
create index if not exists idx_investments_status on public.investments(status);
create index if not exists idx_investments_end_date on public.investments(end_date);

-- 4) Transactions table (optional ledger)
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('deposit','payout','reinvest')),
  amount numeric(18,2) not null,
  plan_label text,
  timestamp timestamptz default now(),
  status text default 'processed'
);
create index if not exists idx_transactions_user_id on public.transactions(user_id);

-- 5) Community comments (optional forum store)
create table if not exists public.community_comments (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  username text,
  user_rank text,
  avatar_seed text,
  content text not null,
  timestamp timestamptz default now(),
  likes integer default 0
);
create index if not exists idx_comments_user_id on public.community_comments(user_id);

-- 6) Helper: updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to tables that include updated_at
create trigger investments_set_updated_at
before update on public.investments
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 7) Backfill compatibility: if legacy `rank` column exists, copy values into `user_rank`
-- This is safe to run: it will create `user_rank` if missing and copy values if `rank` exists.
alter table public.profiles add column if not exists user_rank text;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'rank') then
    update public.profiles set user_rank = rank where user_rank is null and rank is not null;
  end if;
end
$$;

-- 8) Optional cleanup: drop legacy `rank` column after you verify `user_rank` is populated
-- alter table public.profiles drop column if exists rank;

-- 9) Safety / convenience: grant read access to authenticated users (optional)
-- grant select on public.profiles, public.investments, public.transactions, public.community_comments to authenticated;

-- Done.
-- Copy this SQL into the Supabase SQL editor and run. Verify results in the Table Editor afterward.
