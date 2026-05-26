-- Leenout Database Schema - Edit Windows, Sessions & Moderator Controls

-- 1. Edit Windows Table
create table if not exists public.edit_windows (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  contributor_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('scheduled', 'active', 'completed')) default 'scheduled'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Edit Sessions Table (Owner Reversions History Log)
create table if not exists public.edit_sessions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  file_id uuid references public.project_files(id) on delete cascade not null,
  editor_id uuid references public.profiles(id) on delete cascade not null,
  content_snapshot text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Kicks Table (Moderation Cooldown Logs)
create table if not exists public.kicks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  kicked_user_id uuid references public.profiles(id) on delete cascade not null,
  kicked_by uuid references public.profiles(id) on delete cascade not null,
  reason text,
  cooldown_until timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.edit_windows enable row level security;
alter table public.edit_sessions enable row level security;
alter table public.kicks enable row level security;

-- 5. RLS Policies

-- Edit Windows policies
create policy "Edit windows are viewable by everyone"
  on public.edit_windows for select
  using (true);

create policy "Owners can insert edit windows"
  on public.edit_windows for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = edit_windows.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "Owners can update edit windows"
  on public.edit_windows for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = edit_windows.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "Owners can delete edit windows"
  on public.edit_windows for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = edit_windows.project_id and projects.owner_id = auth.uid()
    )
  );

-- Edit Sessions policies
create policy "Sessions viewable by owner and contributor"
  on public.edit_sessions for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = edit_sessions.project_id and projects.owner_id = auth.uid()
    ) or editor_id = auth.uid()
  );

create policy "Contributors can insert edit sessions"
  on public.edit_sessions for insert
  with check (
    auth.uid() = editor_id and (
      -- Must be owner or have active window right now
      exists (
        select 1 from public.projects
        where projects.id = edit_sessions.project_id and projects.owner_id = auth.uid()
      ) or exists (
        select 1 from public.edit_windows
        where edit_windows.project_id = edit_sessions.project_id
          and edit_windows.contributor_id = auth.uid()
          and edit_windows.status in ('active', 'scheduled')
          and now() between edit_windows.start_time and edit_windows.end_time
      )
    )
  );

-- Kicks policies
create policy "Kicks viewable by everyone"
  on public.kicks for select
  using (true);

create policy "Owners can log kicks"
  on public.kicks for insert
  with check (
    auth.uid() = kicked_by and
    exists (
      select 1 from public.projects
      where projects.id = kicks.project_id and projects.owner_id = auth.uid()
    )
  );

-- 6. Access Request Policy Cooldown Update
drop policy if exists "Authenticated users can submit requests" on public.access_requests;

create policy "Authenticated users can submit requests if not on cooldown"
  on public.access_requests for insert
  with check (
    auth.uid() = requester_id and
    not exists (
      select 1 from public.kicks
      where kicks.project_id = access_requests.project_id
        and kicks.kicked_user_id = auth.uid()
        and kicks.cooldown_until > now()
    )
  );
