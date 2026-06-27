-- =====================================================================
-- MCRP — Migration 01: Extensions & Enumerated Types
-- Source of truth: docs/phase-3-database-schema.md  (§2)
-- =====================================================================

-- pg_trgm powers fuzzy/partial text search (admin search on names, colleges).
-- Installed in the dedicated `extensions` schema (Supabase convention).
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------
-- Enumerated types (fixed, small value sets)
-- Wrapped in DO blocks so the migration is safely re-runnable.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'gender_type') then
    create type public.gender_type as enum ('male', 'female', 'other', 'prefer_not_to_say');
  end if;

  if not exists (select 1 from pg_type where typname = 'skill_category') then
    create type public.skill_category as enum
      ('programming_language', 'framework', 'database', 'tool', 'cloud_platform', 'soft_skill', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'proficiency_level') then
    create type public.proficiency_level as enum ('beginner', 'intermediate', 'advanced', 'expert');
  end if;

  if not exists (select 1 from pg_type where typname = 'experience_type') then
    create type public.experience_type as enum ('internship', 'freelance', 'work', 'startup');
  end if;

  if not exists (select 1 from pg_type where typname = 'link_platform') then
    create type public.link_platform as enum
      ('github', 'linkedin', 'portfolio', 'hackerrank', 'leetcode', 'codechef', 'kaggle', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'document_type') then
    create type public.document_type as enum ('resume', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'score_type') then
    create type public.score_type as enum ('cgpa', 'percentage');
  end if;

  if not exists (select 1 from pg_type where typname = 'candidate_status') then
    create type public.candidate_status as enum ('active', 'disabled');
  end if;

  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type public.registration_status as enum
      ('registered', 'email_verified', 'profile_started', 'resume_uploaded', 'profile_completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('candidate', 'admin', 'super_admin');
  end if;
end
$$;
