-- =====================================================================
-- MCRP — Migration 02: Tables
-- Source of truth: docs/phase-3-database-schema.md  (§3)
--
-- Notes / reconciliations vs the design doc (flagged in the module doc):
--  * Case-insensitive uniqueness (email, skill/college name) is implemented
--    with `lower(...)` functional UNIQUE indexes instead of the `citext` type.
--    Same behaviour, no extra extension/search_path coupling.
--  * `candidates.mobile` is NULLABLE so Google/OAuth sign-ups (which provide no
--    mobile) can register and add it during onboarding. Duplicate detection is
--    preserved: the UNIQUE constraint blocks duplicate *provided* numbers
--    (PostgreSQL allows multiple NULLs).
-- =====================================================================

-- Per-month counter that backs the MCR<YY><MM><NNNN> candidate code.
create table if not exists public.candidate_code_counters (
  period      char(4) primary key,            -- 'YYMM'
  last_value  integer not null default 0
);

-- Reference: colleges (searchable, add-if-missing, admin-mergeable).
create table if not exists public.colleges (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  city            text,
  state           text,
  is_approved     boolean not null default false,
  merged_into_id  uuid references public.colleges (id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Master: skills (curated by admin).
create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    public.skill_category not null,
  created_at  timestamptz not null default now()
);

-- Core: candidate profile (1:1 with auth.users).
create table if not exists public.candidates (
  id                   uuid primary key references auth.users (id) on delete cascade,
  candidate_code       text not null unique,
  full_name            text not null default '',
  email                text not null,
  mobile               text,
  whatsapp             text,
  date_of_birth        date,
  gender               public.gender_type,
  address              text,
  city                 text,
  state                text,
  pin_code             text,
  status               public.candidate_status not null default 'active',
  registration_status  public.registration_status not null default 'registered',
  profile_completion   smallint not null default 0 check (profile_completion between 0 and 100),
  email_verified       boolean not null default false,
  mobile_verified      boolean not null default false,
  registration_source  text,
  consent_accepted_at  timestamptz,
  consent_version      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,
  constraint candidates_mobile_unique unique (mobile)
);

-- Education (1:N).
create table if not exists public.candidate_education (
  id               uuid primary key default gen_random_uuid(),
  candidate_id     uuid not null references public.candidates (id) on delete cascade,
  college_id       uuid references public.colleges (id) on delete set null,
  college_name     text,
  university       text,
  degree           text,
  branch           text,
  specialization   text,
  current_semester smallint check (current_semester between 1 and 12),
  passing_year     smallint check (passing_year between 1980 and 2100),
  score_type       public.score_type,
  score_value      numeric(5, 2) check (score_value >= 0),
  backlogs         smallint not null default 0 check (backlogs >= 0),
  is_primary       boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Skills (N:M via join).
create table if not exists public.candidate_skills (
  id               uuid primary key default gen_random_uuid(),
  candidate_id     uuid not null references public.candidates (id) on delete cascade,
  skill_id         uuid not null references public.skills (id) on delete cascade,
  proficiency      public.proficiency_level,
  years_experience numeric(3, 1) check (years_experience >= 0),
  created_at       timestamptz not null default now(),
  unique (candidate_id, skill_id)
);

-- Projects (1:N).
create table if not exists public.candidate_projects (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  title        text not null,
  description  text,
  tech_stack   text[] not null default '{}',
  project_url  text,
  repo_url     text,
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Experience (1:N).
create table if not exists public.candidate_experiences (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  type         public.experience_type not null,
  organization text not null,
  title        text,
  description  text,
  location     text,
  start_date   date,
  end_date     date,
  is_current   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Links / professional profiles (1:N).
create table if not exists public.candidate_links (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  platform     public.link_platform not null,
  url          text not null,
  label        text,
  created_at   timestamptz not null default now()
);

-- Career preferences (1:1).
create table if not exists public.candidate_preferences (
  candidate_id       uuid primary key references public.candidates (id) on delete cascade,
  preferred_role     text,
  preferred_location text,
  ready_to_relocate  boolean,
  expected_ctc       numeric(12, 2) check (expected_ctc >= 0),
  immediate_joining  boolean,
  notice_period_days smallint check (notice_period_days >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Documents (1:N; resume in MVP). Bytes live in Storage; DB stores the path.
create table if not exists public.candidate_documents (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  type         public.document_type not null default 'resume',
  file_path    text not null,
  file_name    text,
  mime_type    text,
  size_bytes   integer check (size_bytes >= 0),
  uploaded_at  timestamptz not null default now()
);

-- RBAC: which auth user has which role.
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.app_role not null default 'candidate',
  created_at timestamptz not null default now()
);

-- Lightweight audit trail of admin actions.
create table if not exists public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid references auth.users (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  changes    jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Privileges: allow the `authenticated` role to access public tables;
-- Row Level Security (migration 05) governs which *rows* they may touch.
-- ---------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
