-- Leenout Database Schema

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (public.profiles)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  stack_tags text[] default array[]::text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text not null,
  purpose text not null,
  stack_tags text[] default array[]::text[] not null,
  open_roles text[] default array[]::text[] not null,
  current_problem text,
  is_public boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Project Files Table
create table public.project_files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  filename text not null,
  filepath text not null,
  content text default '' not null,
  last_edited_by uuid references public.profiles(id) on delete set null,
  last_edited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, filepath)
);

-- 5. Access Requests Table
create table public.access_requests (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  status text check (status in ('pending', 'approved', 'denied')) default 'pending'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  unique (project_id, requester_id)
);

-- 6. Contributors Table
create table public.contributors (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  allowed_files text[] default null, -- null = access to all files
  status text check (status in ('active', 'kicked')) default 'active'::text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  kicked_at timestamp with time zone,
  unique (project_id, user_id)
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.access_requests enable row level security;
alter table public.contributors enable row level security;

--------------------------------------------------------------------------------
-- RLS POLICIES
--------------------------------------------------------------------------------

-- Profiles Policies
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Projects Policies
create policy "Public projects are viewable by everyone" 
  on public.projects for select 
  using (is_public = true);

create policy "Private projects are viewable by owner or approved contributors" 
  on public.projects for select 
  using (
    auth.uid() = owner_id or 
    exists (
      select 1 from public.contributors 
      where contributors.project_id = id and contributors.user_id = auth.uid() and contributors.status = 'active'
    )
  );

create policy "Authenticated users can create projects" 
  on public.projects for insert 
  with check (auth.uid() = owner_id);

create policy "Owners can update their own projects" 
  on public.projects for update 
  using (auth.uid() = owner_id);

create policy "Owners can delete their own projects" 
  on public.projects for delete 
  using (auth.uid() = owner_id);

-- Project Files Policies
create policy "Files readable by everyone if project is public" 
  on public.project_files for select 
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_files.project_id and (projects.is_public = true or projects.owner_id = auth.uid())
    ) or exists (
      select 1 from public.contributors 
      where contributors.project_id = project_files.project_id and contributors.user_id = auth.uid() and contributors.status = 'active'
    )
  );

create policy "Files writable by owner or active contributors" 
  on public.project_files for insert 
  with check (
    exists (
      select 1 from public.projects 
      where projects.id = project_files.project_id and projects.owner_id = auth.uid()
    ) or exists (
      select 1 from public.contributors 
      where contributors.project_id = project_files.project_id and contributors.user_id = auth.uid() and contributors.status = 'active'
    )
  );

create policy "Files editable by owner or active contributors" 
  on public.project_files for update 
  using (
    exists (
      select 1 from public.projects 
      where projects.id = project_files.project_id and projects.owner_id = auth.uid()
    ) or exists (
      select 1 from public.contributors 
      where contributors.project_id = project_files.project_id and contributors.user_id = auth.uid() and contributors.status = 'active'
    )
  );

-- Access Requests Policies
create policy "Requests viewable by requester or project owner" 
  on public.access_requests for select 
  using (
    auth.uid() = requester_id or 
    exists (
      select 1 from public.projects 
      where projects.id = access_requests.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "Authenticated users can submit requests" 
  on public.access_requests for insert 
  with check (auth.uid() = requester_id);

create policy "Owners can resolve requests" 
  on public.access_requests for update 
  using (
    exists (
      select 1 from public.projects 
      where projects.id = access_requests.project_id and projects.owner_id = auth.uid()
    )
  );

-- Contributors Policies
create policy "Contributors are readable by everyone" 
  on public.contributors for select 
  using (true);

create policy "Owners can insert contributors" 
  on public.contributors for insert 
  with check (
    exists (
      select 1 from public.projects 
      where projects.id = contributors.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "Owners can update contributors" 
  on public.contributors for update 
  using (
    exists (
      select 1 from public.projects 
      where projects.id = contributors.project_id and projects.owner_id = auth.uid()
    )
  );

create policy "Owners can delete contributors" 
  on public.contributors for delete 
  using (
    exists (
      select 1 from public.projects 
      where projects.id = contributors.project_id and projects.owner_id = auth.uid()
    )
  );

--------------------------------------------------------------------------------
-- TRIGGERS FOR PROFILE CREATION
--------------------------------------------------------------------------------

-- Trigger function to create profile on new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, stack_tags)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'user_name', 
      new.raw_user_meta_data->>'preferred_username', 
      split_part(new.email, '@', 1),
      'coder_' || substring(new.id::text, 1, 8)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url', 
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || coalesce(new.raw_user_meta_data->>'user_name', new.id::text)
    ),
    array[]::text[]
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
