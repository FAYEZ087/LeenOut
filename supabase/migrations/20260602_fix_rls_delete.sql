-- Drop conflicting permissive RLS policy allowing active contributors to delete files
drop policy if exists "Files deletable by owner or active contributors" on public.project_files;
