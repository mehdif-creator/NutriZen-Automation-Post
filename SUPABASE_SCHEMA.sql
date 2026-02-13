-- 1. Helper function to check if user is admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = uid
    and role = 'admin'
  );
$$;

-- 2. OAuth States table (CSRF Protection) - SECURED
create table if not exists public.oauth_states (
  state text primary key,
  created_at timestamptz not null default now()
);

alter table public.oauth_states enable row level security;

-- DROP INSECURE POLICIES IF THEY EXIST
drop policy if exists "Public insert oauth_states" on public.oauth_states;
drop policy if exists "Public select oauth_states" on public.oauth_states;
drop policy if exists "Public delete oauth_states" on public.oauth_states;

-- STRICT POLICY: Effectively denies all external access.
-- Only the service_role (used by Edge Functions) can bypass this.
create policy "Deny all external access" on public.oauth_states
  for all
  using (false)
  with check (false);

-- CLEANUP FUNCTION
create or replace function public.cleanup_expired_oauth_states()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete states older than 20 minutes
  delete from public.oauth_states
  where created_at < (now() - interval '20 minutes');
end;
$$;

-- ATTEMPT TO SCHEDULE CRON (Requires pg_cron extension)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('cleanup-oauth-states', '*/15 * * * *', 'select public.cleanup_expired_oauth_states()');
  end if;
exception when others then
  -- Ignore if pg_cron is not available or permission denied
  raise notice 'pg_cron not available or permission denied, skipping schedule.';
end
$$;

-- 3. Pinterest OAuth Tokens table (Admin Only)
create table if not exists public.pinterest_oauth (
  id uuid default gen_random_uuid() primary key,
  account_label text unique not null default 'default',
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.pinterest_oauth enable row level security;
create policy "Admin only pinterest_oauth" on public.pinterest_oauth 
  for all 
  using (public.is_admin(auth.uid())) 
  with check (public.is_admin(auth.uid()));

-- 4. Social Queue RLS (Admin Only)
alter table public.social_queue enable row level security;
create policy "Admin only social_queue" on public.social_queue
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- 5. Board Map RLS (Admin Only)
alter table public.pinterest_board_map enable row level security;
create policy "Admin only pinterest_board_map" on public.pinterest_board_map
  for all
  using (public.is_admin(auth.uid())) 
  with check (public.is_admin(auth.uid()));

-- 6. Indexes for Performance
create index if not exists idx_social_queue_platform_status_scheduled 
  on public.social_queue(platform, status, scheduled_at);
create index if not exists idx_social_queue_locked_at 
  on public.social_queue(platform, locked_at);
create index if not exists idx_board_map_active_cuisine 
  on public.pinterest_board_map(is_active, cuisine_key);

-- 7. RPC: Dequeue Jobs Atomically (For Worker)
create or replace function public.dequeue_pinterest_jobs(p_limit int default 10)
returns setof public.social_queue
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.social_queue
  set 
    status = 'processing',
    locked_at = now()
  where id in (
    select id
    from public.social_queue
    where platform = 'pinterest'
    and status = 'rendered'
    and (scheduled_at is null or scheduled_at <= now())
    and (locked_at is null or locked_at < now() - interval '15 minutes')
    order by scheduled_at asc nulls first, created_at asc
    limit p_limit
    for update skip locked
  )
  returning *;
end;
$$;