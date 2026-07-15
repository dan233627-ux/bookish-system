-- Add RLS (Row Level Security) Policies for investments table
-- This allows authenticated users to fetch only their own investments
-- Run this in Supabase SQL editor (Database → New query)

-- Enable RLS on investments table
alter table public.investments enable row level security;

-- Policy: Allow authenticated users to select their own investments
create policy "Users can select their own investments"
  on public.investments for select
  using (auth.uid() = user_id);

-- Policy: Allow authenticated users to insert their own investments
create policy "Users can insert their own investments"
  on public.investments for insert
  with check (auth.uid() = user_id);

-- Policy: Allow authenticated users to update their own investments
create policy "Users can update their own investments"
  on public.investments for update
  using (auth.uid() = user_id);

-- Policy: Allow authenticated users to delete their own investments
create policy "Users can delete their own investments"
  on public.investments for delete
  using (auth.uid() = user_id);

-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Policy: Allow authenticated users to select their own profile
create policy "Users can select their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: Allow authenticated users to update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Done
