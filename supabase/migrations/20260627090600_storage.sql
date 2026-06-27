-- =====================================================================
-- MCRP — Migration 06: Storage (resumes bucket)
-- Source of truth: docs/phase-3-database-schema.md  (§3.9, §7)
--
-- Private bucket, PDF-only, 5 MB cap. Files are stored under a per-candidate
-- folder: "<candidate_id>/<filename>". Policies isolate each candidate to
-- their own folder; admins may read all.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "resumes_select_own" on storage.objects;
create policy "resumes_select_own" on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "resumes_insert_own" on storage.objects;
create policy "resumes_insert_own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "resumes_update_own" on storage.objects;
create policy "resumes_update_own" on storage.objects for update to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "resumes_delete_own" on storage.objects;
create policy "resumes_delete_own" on storage.objects for delete to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "resumes_select_admin" on storage.objects;
create policy "resumes_select_admin" on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and (select public.is_admin((select auth.uid())))
  );
