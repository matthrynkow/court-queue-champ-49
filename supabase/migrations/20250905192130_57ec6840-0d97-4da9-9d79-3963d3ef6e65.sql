-- Enable required extension for UUID generation
create extension if not exists pgcrypto with schema extensions;

-- 1) Core tables
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  total_courts int not null check (total_courts > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  court_number int not null,
  created_at timestamptz not null default now(),
  unique(location_id, court_number)
);

create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.court_sessions (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  court_id uuid not null references public.courts(id) on delete cascade,
  court_number int not null,
  player_count int not null check (player_count in (2,4)),
  player_name text not null,
  started_at timestamptz not null default now(),
  duration_minutes int not null check (duration_minutes >= 1 and duration_minutes <= 180),
  ended_at timestamptz null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure only one active session per court
create unique index if not exists idx_unique_active_session_per_court
  on public.court_sessions(court_id)
  where ended_at is null;

create index if not exists idx_sessions_lookup
  on public.court_sessions(location_id, court_number, ended_at);

create table if not exists public.queue_entries (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  player_name text not null,
  player_count int not null check (player_count in (2,4)),
  status text not null default 'waiting' check (status in ('waiting','notified','claimed','removed')),
  added_at timestamptz not null default now(),
  claimed_by_session_id uuid null references public.court_sessions(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_queue_location_status
  on public.queue_entries(location_id, status, added_at);

-- 2) Common trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_sessions_updated_at
before update on public.court_sessions
for each row execute function public.set_updated_at();

create trigger trg_queue_updated_at
before update on public.queue_entries
for each row execute function public.set_updated_at();

-- 3) Row Level Security
alter table public.locations enable row level security;
alter table public.courts enable row level security;
alter table public.profiles enable row level security;
alter table public.court_sessions enable row level security;
alter table public.queue_entries enable row level security;

-- Locations & Courts: public readable, no writes by clients
create policy if not exists "Locations are readable by anyone"
  on public.locations for select using (true);

create policy if not exists "Courts are readable by anyone"
  on public.courts for select using (true);

-- Profiles: users can read all (display names are not sensitive), modify only their own row
create policy if not exists "Profiles readable to authenticated"
  on public.profiles for select to authenticated using (true);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy if not exists "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Sessions: public readable; owners can write
create policy if not exists "Sessions readable by anyone"
  on public.court_sessions for select using (true);

create policy if not exists "Authenticated users can create sessions"
  on public.court_sessions for insert to authenticated with check (auth.uid() = created_by);

create policy if not exists "Owners can update their sessions"
  on public.court_sessions for update to authenticated using (auth.uid() = created_by);

create policy if not exists "Owners can delete their sessions"
  on public.court_sessions for delete to authenticated using (auth.uid() = created_by);

-- Queue: public readable; owners can write
create policy if not exists "Queue readable by anyone"
  on public.queue_entries for select using (true);

create policy if not exists "Authenticated can join queue"
  on public.queue_entries for insert to authenticated with check (auth.uid() = created_by);

create policy if not exists "Owners can update their queue entries"
  on public.queue_entries for update to authenticated using (auth.uid() = created_by);

create policy if not exists "Owners can delete their queue entries"
  on public.queue_entries for delete to authenticated using (auth.uid() = created_by);

-- 4) Realtime configuration (safe to re-run)
alter table public.court_sessions replica identity full;
alter table public.queue_entries replica identity full;

alter publication supabase_realtime add table public.court_sessions;
alter publication supabase_realtime add table public.queue_entries;

-- 5) Seed initial locations and courts
insert into public.locations (slug, name, total_courts)
values
  ('cooper-park', 'Cooper Park', 2),
  ('brian-watkins', 'Brian Watkins Tennis Center', 6),
  ('pier-42', 'Pier 42 Courts', 4)
on conflict (slug) do nothing;

-- Insert courts per location based on total_courts
with loc as (
  select id, slug, total_courts from public.locations
)
select
  case when not exists (
    select 1 from public.courts c where c.location_id = l.id
  ) then (
    -- generate courts 1..N per location
    (select count(*) from (
      select generate_series(1, l.total_courts) as n
    ) gs
    left join public.courts c on c.location_id = l.id and c.court_number = gs.n
    where c.id is null
    )
  ) else 0 end as inserted
from loc l;

-- Upsert courts using generate_series for each location
insert into public.courts (location_id, court_number)
select l.id, gs.n
from public.locations l
join generate_series(1, 20) as gs(n) on gs.n <= l.total_courts
left join public.courts c on c.location_id = l.id and c.court_number = gs.n
where c.id is null;