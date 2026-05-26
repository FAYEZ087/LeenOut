-- Leenout Database Schema - RLS Helpers for Project Files

-- 1. Helper Functions
create or replace function public.is_owner(project_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.projects
    where projects.id = project_id
      and projects.owner_id = auth.uid()
  );
$$;

create or replace function public.has_active_window(project_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.edit_windows
    join public.contributors
      on contributors.project_id = edit_windows.project_id
     and contributors.user_id = edit_windows.contributor_id
     and contributors.status = 'active'
    where edit_windows.project_id = project_id
      and edit_windows.contributor_id = auth.uid()
      and edit_windows.status in ('active', 'scheduled')
      and now() between edit_windows.start_time and edit_windows.end_time
  );
$$;

create or replace function public.is_file_allowed(contributor_id uuid, file_path text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.contributors
    where contributors.user_id = contributor_id
      and contributors.status = 'active'
      and (
        contributors.allowed_files is null
        or file_path = any(contributors.allowed_files)
      )
  );
$$;

-- 2. Update Project Files Policies
drop policy if exists "Files writable by owner or active contributors" on public.project_files;
drop policy if exists "Files editable by owner or active contributors" on public.project_files;
drop policy if exists "Files deletable by owner or active contributors" on public.project_files;

create policy "Files insertable by owner or active contributors with allowed files"
  on public.project_files for insert
  with check (
    is_owner(project_id)
    or (has_active_window(project_id) and is_file_allowed(auth.uid(), filepath))
  );

create policy "Files updatable by owner or active contributors with allowed files"
  on public.project_files for update
  using (
    is_owner(project_id)
    or (has_active_window(project_id) and is_file_allowed(auth.uid(), filepath))
  );

create policy "Files deletable by owner only"
  on public.project_files for delete
  using (is_owner(project_id));
