-- Supabase migration script to store user payout wallet addresses
-- Run this SQL in the Supabase SQL editor (Database → New query) or via your migration tooling.

create table if not exists public.withdrawal_addresses (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  currency text not null check (currency in ('TRX','USDT','BTC','ETH')),
  address text not null,
  updated_at timestamptz default now()
);

alter table public.withdrawal_addresses alter column updated_at set default now();

create unique index if not exists idx_withdrawal_addresses_user_id on public.withdrawal_addresses(user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger withdrawal_addresses_set_updated_at
before update on public.withdrawal_addresses
for each row execute function public.set_updated_at();
