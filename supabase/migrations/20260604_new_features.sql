-- Leenout Schema Expansion for Speed-Run Challenges, Bounties, Session Branches, & File Masking

-- 1. Add File Masking column to project_files
alter table public.project_files 
  add column if not exists is_masked boolean default false;

-- 2. Challenges Table (Speed-Runs)
create table if not exists public.challenges (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text not null,
  time_limit_minutes integer default 30,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Challenge Attempts & Leaderboard
create table if not exists public.challenge_attempts (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  completed_in_seconds integer not null,
  score integer default 100,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Micro-Bounties Table
create table if not exists public.bounties (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  filepath text not null,
  title text not null,
  reward_amount text default '$15',
  status text default 'open', -- open, claimed, merged
  winner_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Session Branches Table (Draft Edit Windows for Owner Review & Merge)
create table if not exists public.session_branches (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  contributor_id uuid references auth.users(id) on delete cascade,
  branch_name text not null,
  status text default 'pending', -- pending, merged, rejected
  files_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.challenges enable row level security;
alter table public.challenge_attempts enable row level security;
alter table public.bounties enable row level security;
alter table public.session_branches enable row level security;

-- Public read for challenges & leaderboards
create policy "Public read challenges" on public.challenges for select using (true);
create policy "Public read attempts" on public.challenge_attempts for select using (true);
create policy "Authenticated insert attempts" on public.challenge_attempts for insert with check (auth.role() = 'authenticated');

-- Bounties RLS
create policy "Public read bounties" on public.bounties for select using (true);
create policy "Owner manage bounties" on public.bounties for all using (auth.role() = 'authenticated');

-- Session Branches RLS
create policy "Contributors create session branches" on public.session_branches for insert with check (auth.role() = 'authenticated');
create policy "Project owners & contributors view branches" on public.session_branches for select using (auth.role() = 'authenticated');
create policy "Project owners manage session branches" on public.session_branches for update using (auth.role() = 'authenticated');
