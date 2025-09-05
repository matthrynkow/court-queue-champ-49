-- Make policy creation idempotent using DO blocks

-- Locations select policy
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'locations' and p.policyname = 'Locations are readable by anyone'
  ) then
    create policy "Locations are readable by anyone"
      on public.locations for select using (true);
  end if;
end$$;

-- Courts select policy
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'courts' and p.policyname = 'Courts are readable by anyone'
  ) then
    create policy "Courts are readable by anyone"
      on public.courts for select using (true);
  end if;
end$$;

-- Profiles policies
-- select
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'profiles' and p.policyname = 'Profiles readable to authenticated'
  ) then
    create policy "Profiles readable to authenticated"
      on public.profiles for select to authenticated using (true);
  end if;
end$$;

-- insert
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'profiles' and p.policyname = 'Users can insert their own profile'
  ) then
    create policy "Users can insert their own profile"
      on public.profiles for insert to authenticated with check (auth.uid() = id);
  end if;
end$$;

-- update
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'profiles' and p.policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
      on public.profiles for update to authenticated using (auth.uid() = id);
  end if;
end$$;

-- Sessions policies
-- select
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'court_sessions' and p.policyname = 'Sessions readable by anyone'
  ) then
    create policy "Sessions readable by anyone"
      on public.court_sessions for select using (true);
  end if;
end$$;

-- insert
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'court_sessions' and p.policyname = 'Authenticated users can create sessions'
  ) then
    create policy "Authenticated users can create sessions"
      on public.court_sessions for insert to authenticated with check (auth.uid() = created_by);
  end if;
end$$;

-- update
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'court_sessions' and p.policyname = 'Owners can update their sessions'
  ) then
    create policy "Owners can update their sessions"
      on public.court_sessions for update to authenticated using (auth.uid() = created_by);
  end if;
end$$;

-- delete
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'court_sessions' and p.policyname = 'Owners can delete their sessions'
  ) then
    create policy "Owners can delete their sessions"
      on public.court_sessions for delete to authenticated using (auth.uid() = created_by);
  end if;
end$$;

-- Queue policies
-- select
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'queue_entries' and p.policyname = 'Queue readable by anyone'
  ) then
    create policy "Queue readable by anyone"
      on public.queue_entries for select using (true);
  end if;
end$$;

-- insert
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'queue_entries' and p.policyname = 'Authenticated can join queue'
  ) then
    create policy "Authenticated can join queue"
      on public.queue_entries for insert to authenticated with check (auth.uid() = created_by);
  end if;
end$$;

-- update
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'queue_entries' and p.policyname = 'Owners can update their queue entries'
  ) then
    create policy "Owners can update their queue entries"
      on public.queue_entries for update to authenticated using (auth.uid() = created_by);
  end if;
end$$;

-- delete
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'queue_entries' and p.policyname = 'Owners can delete their queue entries'
  ) then
    create policy "Owners can delete their queue entries"
      on public.queue_entries for delete to authenticated using (auth.uid() = created_by);
  end if;
end$$;

-- Ensure RLS is enabled (idempotent)
alter table public.locations enable row level security;
alter table public.courts enable row level security;
alter table public.profiles enable row level security;
alter table public.court_sessions enable row level security;
alter table public.queue_entries enable row level security;

-- Realtime publication additions guarded
do $$
begin
  begin
    alter publication supabase_realtime add table public.court_sessions;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.queue_entries;
  exception when duplicate_object then null;
  end;
end$$;