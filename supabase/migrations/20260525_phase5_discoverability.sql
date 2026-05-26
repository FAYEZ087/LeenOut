-- Leenout Database Schema - Discoverability & Platform Forking

-- 1. Alter projects to track fork origins
alter table public.projects 
  add column if not exists forked_from_id uuid references public.projects(id) on delete set null;

-- 2. Create Watchers Table
create table if not exists public.project_watchers (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, user_id)
);

-- 3. Enable Row Level Security (RLS)
alter table public.project_watchers enable row level security;

-- 4. Formulate Watchers Policies
create policy "Watchers are viewable by everyone"
  on public.project_watchers for select
  using (true);

create policy "Authenticated users can watch projects"
  on public.project_watchers for insert
  with check (auth.uid() = user_id);

create policy "Users can unwatch projects"
  on public.project_watchers for delete
  using (auth.uid() = user_id);
