-- Supabase metric functions for Forex Royal investment dashboard
-- Run this in Supabase SQL editor or in migration tooling.

-- 1) Compute current value for an investment at a given timestamp.
create or replace function public.investment_current_value_at(
  as_of timestamptz,
  inv_start timestamptz,
  inv_end timestamptz,
  inv_capital numeric,
  inv_roi numeric,
  inv_status text
) returns numeric stable as $$
  select
    case
      when inv_status = 'pending' then 0
      when inv_start is null or inv_end is null or inv_capital is null or inv_roi is null then 0
      when as_of <= inv_start then inv_capital
      when as_of >= inv_end then inv_roi
      else inv_capital + (inv_roi - inv_capital) * extract(epoch from (as_of - inv_start)) / nullif(extract(epoch from (inv_end - inv_start)), 0)
    end;
$$ language sql;

-- 2) Convenience wrapper for current value at the present moment.
create or replace function public.investment_current_value(
  inv_start timestamptz,
  inv_end timestamptz,
  inv_capital numeric,
  inv_roi numeric,
  inv_status text
) returns numeric stable as $$
  select public.investment_current_value_at(now(), inv_start, inv_end, inv_capital, inv_roi, inv_status);
$$ language sql;

-- 3) Aggregate dashboard metrics from investments.
drop function if exists public.get_dashboard_metrics();
create or replace function public.get_dashboard_metrics()
returns table (
  total_pool_size numeric,
  active_royal_traders integer,
  total_roi_payouts numeric,
  weekly_growth_pct numeric,
  joined_today integer,
  active_contracts integer,
  total_active_value numeric,
  total_invested numeric,
  total_pending_roi numeric
) stable as $$
  with investment_values as (
    select
      i.*,
      public.investment_current_value_at(now(), i.start_date, i.end_date, i.capital, i.roi, i.status) as current_value,
      public.investment_current_value_at(now() - interval '7 days', i.start_date, i.end_date, i.capital, i.roi, i.status) as value_week_ago
    from public.investments i
  )
  select
    coalesce(sum(case when status in ('active','completed') then current_value else 0 end), 0) as total_pool_size,
    coalesce(count(distinct case when status in ('active','completed') then user_id end), 0) as active_royal_traders,
    coalesce(sum(case when status = 'claimed' then roi else 0 end), 0) as total_roi_payouts,
    coalesce(
      case when sum(value_week_ago) > 0 then (sum(case when status in ('active','completed') then current_value else 0 end) - sum(case when status in ('active','completed') then value_week_ago else 0 end)) / nullif(sum(case when status in ('active','completed') then value_week_ago else 0 end), 0) * 100 else 0 end,
      0
    ) as weekly_growth_pct,
    coalesce(sum(case when status in ('active','completed') and created_at >= now() - interval '1 day' then 1 else 0 end), 0) as joined_today,
    coalesce(sum(case when status in ('active','completed') then 1 else 0 end), 0) as active_contracts,
    coalesce(sum(case when status in ('active','completed') then current_value else 0 end), 0) as total_active_value,
    coalesce(sum(capital), 0) as total_invested,
    coalesce(sum(case when status in ('active','completed') then current_value - capital else 0 end), 0) as total_pending_roi
  from investment_values;
$$ language sql;

-- 4) Optional: create a view for current investment values per contract.
create or replace view public.view_investment_current_value as
select
  id,
  user_id,
  plan_id,
  plan_label,
  category,
  capital,
  roi,
  duration_hours,
  start_date,
  end_date,
  status,
  screenshot_url,
  payment_method,
  public.investment_current_value(start_date, end_date, capital, roi, status) as current_value,
  public.investment_current_value(start_date, end_date, capital, roi, status) - capital as current_gain,
  created_at,
  updated_at
from public.investments;
