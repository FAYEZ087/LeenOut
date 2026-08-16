-- Leenout Performance & RLS Query Optimization Indexes

-- 1. Accelerate owner lookups on projects table
create index if not exists idx_projects_owner_id 
  on public.projects(owner_id);

-- 2. Accelerate contributor status and permission lookups
create index if not exists idx_contributors_project_user_status 
  on public.contributors(project_id, user_id, status);

-- 3. Accelerate active edit window RLS evaluations
create index if not exists idx_edit_windows_active_lookup 
  on public.edit_windows(project_id, contributor_id, status, start_time, end_time);

-- 4. Accelerate access requests lookups by project and requester
create index if not exists idx_access_requests_project_requester 
  on public.access_requests(project_id, requester_id, status);

-- 5. Accelerate project file queries by project ID
create index if not exists idx_project_files_project_id 
  on public.project_files(project_id);

-- 6. Accelerate project watcher lookups
create index if not exists idx_project_watchers_project_user 
  on public.project_watchers(project_id, user_id);
