-- Leenout Database Schema - Restrict Project File Deletes to Owners

drop policy if exists "Files deletable by owner only" on public.project_files;
drop policy if exists "Files deletable by owner or active contributors" on public.project_files;

create policy "Files deletable by owner only"
  on public.project_files for delete
  using (
    (select owner_id from public.projects where id = project_id) = auth.uid()
  );
