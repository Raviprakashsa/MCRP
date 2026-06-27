-- =====================================================================
-- MCRP — Migration 04: Functions & Triggers
-- Source of truth: docs/phase-3-database-schema.md  (§3.13, §8, §8.1)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Generic: keep updated_at fresh on row updates.
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.candidate_education;
create trigger set_updated_at before update on public.candidate_education
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.candidate_projects;
create trigger set_updated_at before update on public.candidate_projects
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.candidate_experiences;
create trigger set_updated_at before update on public.candidate_experiences
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.candidate_preferences;
create trigger set_updated_at before update on public.candidate_preferences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RBAC helper: is this user an admin? (security definer to read user_roles
-- regardless of the caller's RLS).
-- ---------------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = uid and r.role in ('admin', 'super_admin')
  );
$$;

-- ---------------------------------------------------------------------
-- Candidate code: MCR-YY-MM-NNNN, per-month sequence, race-safe.
-- ---------------------------------------------------------------------
create or replace function public.assign_candidate_code()
returns trigger
language plpgsql
as $$
declare
  v_period char(4) := to_char(now(), 'YYMM');
  v_next   integer;
begin
  if new.candidate_code is not null and new.candidate_code <> '' then
    return new;
  end if;

  insert into public.candidate_code_counters as c (period, last_value)
  values (v_period, 1)
  on conflict (period) do update set last_value = c.last_value + 1
  returning last_value into v_next;

  -- Human-readable: MCR-YY-MM-NNNN  (v_period is 'YYMM')
  new.candidate_code := 'MCR-' || substr(v_period, 1, 2) || '-'
                        || substr(v_period, 3, 2) || '-'
                        || lpad(v_next::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists candidates_assign_code on public.candidates;
create trigger candidates_assign_code before insert on public.candidates
  for each row execute function public.assign_candidate_code();

-- ---------------------------------------------------------------------
-- Registration-status ordering (forward-only lifecycle).
-- ---------------------------------------------------------------------
create or replace function public.registration_status_rank(s public.registration_status)
returns integer
language sql
immutable
as $$
  select case s
    when 'registered'        then 0
    when 'email_verified'    then 1
    when 'profile_started'   then 2
    when 'resume_uploaded'   then 3
    when 'profile_completed' then 4
  end;
$$;

-- ---------------------------------------------------------------------
-- Derived fields: profile_completion (0-100) + registration_status.
-- Runs BEFORE INSERT/UPDATE on candidates so it sets values in-place with no
-- recursion. Weights per Phase 3 §8.
-- ---------------------------------------------------------------------
create or replace function public.compute_candidate_derived()
returns trigger
language plpgsql
as $$
declare
  v_score    integer := 0;
  v_personal boolean;
  v_education boolean;
  v_skills   boolean;
  v_resume   boolean;
  v_expproj  boolean;
  v_links    boolean;
  v_prefs    boolean;
  v_started  boolean;
  v_status   public.registration_status;
  v_new_rank integer;
  v_old_rank integer;
begin
  v_personal := coalesce(new.full_name, '') <> ''
            and new.mobile is not null
            and new.city is not null
            and new.state is not null
            and new.date_of_birth is not null
            and new.gender is not null;

  select exists (
    select 1 from public.candidate_education e
    where e.candidate_id = new.id
      and coalesce(e.degree, '') <> ''
      and (e.college_id is not null or coalesce(e.college_name, '') <> '')
      and e.passing_year is not null
  ) into v_education;

  select count(*) >= 3 from public.candidate_skills s where s.candidate_id = new.id
    into v_skills;

  select exists (
    select 1 from public.candidate_documents d
    where d.candidate_id = new.id and d.type = 'resume'
  ) into v_resume;

  select exists (select 1 from public.candidate_projects p where p.candidate_id = new.id)
      or exists (select 1 from public.candidate_experiences x where x.candidate_id = new.id)
    into v_expproj;

  select exists (select 1 from public.candidate_links l where l.candidate_id = new.id)
    into v_links;

  select exists (
    select 1 from public.candidate_preferences pr
    where pr.candidate_id = new.id and coalesce(pr.preferred_role, '') <> ''
  ) into v_prefs;

  if v_personal  then v_score := v_score + 25; end if;
  if v_education then v_score := v_score + 20; end if;
  if v_skills    then v_score := v_score + 15; end if;
  if v_resume    then v_score := v_score + 15; end if;
  if v_expproj   then v_score := v_score + 15; end if;
  if v_links     then v_score := v_score + 5;  end if;
  if v_prefs     then v_score := v_score + 5;  end if;

  new.profile_completion := v_score;

  v_started := v_personal or v_education or v_skills or v_expproj or v_links or v_prefs;
  v_status := case
    when v_score >= 100        then 'profile_completed'
    when v_resume              then 'resume_uploaded'
    when v_started             then 'profile_started'
    when new.email_verified    then 'email_verified'
    else 'registered'
  end;

  -- Forward-only: never regress the lifecycle stage.
  v_new_rank := public.registration_status_rank(v_status);
  v_old_rank := case
    when tg_op = 'UPDATE' then public.registration_status_rank(old.registration_status)
    else 0
  end;

  if v_new_rank >= v_old_rank then
    new.registration_status := v_status;
  else
    new.registration_status := old.registration_status;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists candidates_compute_derived on public.candidates;
create trigger candidates_compute_derived before insert or update on public.candidates
  for each row execute function public.compute_candidate_derived();

-- ---------------------------------------------------------------------
-- "Touch" the parent candidate when child rows change, so the derived
-- fields recompute. The UPDATE fires compute_candidate_derived (BEFORE),
-- which recomputes in-place — no recursion.
-- ---------------------------------------------------------------------
create or replace function public.touch_candidate()
returns trigger
language plpgsql
as $$
declare
  v_id uuid;
begin
  v_id := case when tg_op = 'DELETE' then old.candidate_id else new.candidate_id end;
  update public.candidates set updated_at = now() where id = v_id;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists touch_candidate on public.candidate_education;
create trigger touch_candidate after insert or update or delete on public.candidate_education
  for each row execute function public.touch_candidate();

drop trigger if exists touch_candidate on public.candidate_skills;
create trigger touch_candidate after insert or update or delete on public.candidate_skills
  for each row execute function public.touch_candidate();

drop trigger if exists touch_candidate on public.candidate_projects;
create trigger touch_candidate after insert or update or delete on public.candidate_projects
  for each row execute function public.touch_candidate();

drop trigger if exists touch_candidate on public.candidate_experiences;
create trigger touch_candidate after insert or update or delete on public.candidate_experiences
  for each row execute function public.touch_candidate();

drop trigger if exists touch_candidate on public.candidate_links;
create trigger touch_candidate after insert or update or delete on public.candidate_links
  for each row execute function public.touch_candidate();

drop trigger if exists touch_candidate on public.candidate_preferences;
create trigger touch_candidate after insert or update or delete on public.candidate_preferences
  for each row execute function public.touch_candidate();

drop trigger if exists touch_candidate on public.candidate_documents;
create trigger touch_candidate after insert or update or delete on public.candidate_documents
  for each row execute function public.touch_candidate();

-- ---------------------------------------------------------------------
-- Provision a candidate profile + default role when an auth user signs up.
-- Reads metadata passed at sign-up (full_name, mobile, whatsapp). Security
-- definer so it can write regardless of the caller's RLS.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.candidates (id, full_name, email, mobile, whatsapp, email_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'mobile', ''),
    nullif(new.raw_user_meta_data ->> 'whatsapp', ''),
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'candidate')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Mirror email verification from auth.users onto the candidate profile.
-- ---------------------------------------------------------------------
create or replace function public.sync_email_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.candidates set email_verified = true where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed after update on auth.users
  for each row execute function public.sync_email_verified();
