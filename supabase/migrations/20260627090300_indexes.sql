-- =====================================================================
-- MCRP — Migration 03: Indexes & search strategy
-- Source of truth: docs/phase-3-database-schema.md  (§6)
-- =====================================================================

-- --- Case-insensitive uniqueness (replaces citext) -------------------
create unique index if not exists candidates_email_lower_key
  on public.candidates (lower(email));
create unique index if not exists skills_name_lower_key
  on public.skills (lower(name));
create unique index if not exists colleges_name_lower_key
  on public.colleges (lower(name));

-- --- Partial uniqueness ----------------------------------------------
-- At most one resume document per candidate.
create unique index if not exists candidate_documents_one_resume
  on public.candidate_documents (candidate_id)
  where type = 'resume';

-- A known platform link can appear once per candidate ('other' may repeat).
create unique index if not exists candidate_links_unique_known_platform
  on public.candidate_links (candidate_id, platform)
  where platform <> 'other';

-- --- Candidate filters & search --------------------------------------
create index if not exists candidates_city_idx on public.candidates (city);
create index if not exists candidates_state_idx on public.candidates (state);
create index if not exists candidates_status_idx on public.candidates (status);
create index if not exists candidates_reg_status_idx on public.candidates (registration_status);
create index if not exists candidates_created_at_idx on public.candidates (created_at desc);
create index if not exists candidates_mobile_idx on public.candidates (mobile);
create index if not exists candidates_full_name_trgm
  on public.candidates using gin (full_name extensions.gin_trgm_ops);
create index if not exists candidates_email_trgm
  on public.candidates using gin (email extensions.gin_trgm_ops);

-- --- Education filters ------------------------------------------------
create index if not exists candidate_education_candidate_idx on public.candidate_education (candidate_id);
create index if not exists candidate_education_college_idx on public.candidate_education (college_id);
create index if not exists candidate_education_branch_idx on public.candidate_education (branch);
create index if not exists candidate_education_degree_idx on public.candidate_education (degree);
create index if not exists candidate_education_passing_year_idx on public.candidate_education (passing_year);
create index if not exists candidate_education_college_name_trgm
  on public.candidate_education using gin (college_name extensions.gin_trgm_ops);

-- --- Skills filter ----------------------------------------------------
create index if not exists candidate_skills_candidate_idx on public.candidate_skills (candidate_id);
create index if not exists candidate_skills_skill_idx on public.candidate_skills (skill_id);

-- --- Other child-table foreign keys ----------------------------------
create index if not exists candidate_projects_candidate_idx on public.candidate_projects (candidate_id);
create index if not exists candidate_experiences_candidate_idx on public.candidate_experiences (candidate_id);
create index if not exists candidate_links_candidate_idx on public.candidate_links (candidate_id);
create index if not exists candidate_documents_candidate_idx on public.candidate_documents (candidate_id);

-- --- Colleges search --------------------------------------------------
create index if not exists colleges_name_trgm
  on public.colleges using gin (name extensions.gin_trgm_ops);

-- --- Audit ------------------------------------------------------------
create index if not exists audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id);
