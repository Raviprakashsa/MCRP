-- =====================================================================
-- MCRP — Migration 05: Row Level Security
-- Source of truth: docs/phase-3-database-schema.md  (§7)
--
-- Pattern: a candidate may only read/write rows tied to their own auth.uid();
-- admins/super-admins may read & write all. `auth.uid()` is wrapped in a
-- sub-select so PostgreSQL evaluates it once per query (init-plan), and the
-- admin check is likewise cached.
-- =====================================================================

create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = uid and r.role = 'super_admin'
  );
$$;

-- Enable RLS everywhere. The candidate-code counter has RLS enabled with NO
-- policies: it is written only via the security-definer sign-up path, so direct
-- access by the `authenticated` role is denied (prevents tampering).
alter table public.candidate_code_counters enable row level security;
alter table public.candidates            enable row level security;
alter table public.candidate_education   enable row level security;
alter table public.candidate_skills      enable row level security;
alter table public.candidate_projects    enable row level security;
alter table public.candidate_experiences enable row level security;
alter table public.candidate_links       enable row level security;
alter table public.candidate_preferences enable row level security;
alter table public.candidate_documents   enable row level security;
alter table public.skills                enable row level security;
alter table public.colleges              enable row level security;
alter table public.user_roles            enable row level security;
alter table public.audit_logs            enable row level security;

-- =====================================================================
-- candidates
-- =====================================================================
drop policy if exists candidates_select on public.candidates;
create policy candidates_select on public.candidates for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin((select auth.uid()))));

drop policy if exists candidates_update on public.candidates;
create policy candidates_update on public.candidates for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin((select auth.uid()))))
  with check (id = (select auth.uid()) or (select public.is_admin((select auth.uid()))));

drop policy if exists candidates_delete on public.candidates;
create policy candidates_delete on public.candidates for delete to authenticated
  using ((select public.is_admin((select auth.uid()))));

-- =====================================================================
-- Child tables keyed by candidate_id (own-or-admin, full CRUD)
-- =====================================================================
do $$
declare
  t text;
  child_tables text[] := array[
    'candidate_education', 'candidate_skills', 'candidate_projects',
    'candidate_experiences', 'candidate_links', 'candidate_documents',
    'candidate_preferences'
  ];
begin
  foreach t in array child_tables loop
    execute format('drop policy if exists %I_select on public.%I;', t, t);
    execute format(
      'create policy %I_select on public.%I for select to authenticated
         using (candidate_id = (select auth.uid()) or (select public.is_admin((select auth.uid()))));',
      t, t);

    execute format('drop policy if exists %I_insert on public.%I;', t, t);
    execute format(
      'create policy %I_insert on public.%I for insert to authenticated
         with check (candidate_id = (select auth.uid()) or (select public.is_admin((select auth.uid()))));',
      t, t);

    execute format('drop policy if exists %I_update on public.%I;', t, t);
    execute format(
      'create policy %I_update on public.%I for update to authenticated
         using (candidate_id = (select auth.uid()) or (select public.is_admin((select auth.uid()))))
         with check (candidate_id = (select auth.uid()) or (select public.is_admin((select auth.uid()))));',
      t, t);

    execute format('drop policy if exists %I_delete on public.%I;', t, t);
    execute format(
      'create policy %I_delete on public.%I for delete to authenticated
         using (candidate_id = (select auth.uid()) or (select public.is_admin((select auth.uid()))));',
      t, t);
  end loop;
end
$$;

-- =====================================================================
-- skills (master): everyone signed-in reads; admins manage
-- =====================================================================
drop policy if exists skills_select on public.skills;
create policy skills_select on public.skills for select to authenticated using (true);

drop policy if exists skills_write on public.skills;
create policy skills_write on public.skills for all to authenticated
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- =====================================================================
-- colleges: signed-in reads; signed-in may add-if-missing; admins manage
-- =====================================================================
drop policy if exists colleges_select on public.colleges;
create policy colleges_select on public.colleges for select to authenticated using (true);

drop policy if exists colleges_insert on public.colleges;
create policy colleges_insert on public.colleges for insert to authenticated with check (true);

drop policy if exists colleges_update on public.colleges;
create policy colleges_update on public.colleges for update to authenticated
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

drop policy if exists colleges_delete on public.colleges;
create policy colleges_delete on public.colleges for delete to authenticated
  using ((select public.is_admin((select auth.uid()))));

-- =====================================================================
-- user_roles: read own or admin; only super_admin may change roles
-- =====================================================================
drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin((select auth.uid()))));

drop policy if exists user_roles_write on public.user_roles;
create policy user_roles_write on public.user_roles for all to authenticated
  using ((select public.is_super_admin((select auth.uid()))))
  with check ((select public.is_super_admin((select auth.uid()))));

-- =====================================================================
-- audit_logs: admins read; admins insert (as themselves); no update/delete
-- =====================================================================
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs for select to authenticated
  using ((select public.is_admin((select auth.uid()))));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs for insert to authenticated
  with check ((select public.is_admin((select auth.uid()))) and actor_id = (select auth.uid()));
