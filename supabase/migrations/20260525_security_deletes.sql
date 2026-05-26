create policy "Files deletable by owner or active contributors"
  on public.project_files for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_files.project_id and projects.owner_id = auth.uid()
    ) or exists (
      select 1 from public.contributors
      where contributors.project_id = project_files.project_id and contributors.user_id = auth.uid() and contributors.status = 'active'
    )
  );
