-- =====================================================================
-- MCRP — Migration 08: app_settings (forward-prep, no feature yet)
--
-- A generic key/value (jsonb) settings store so future capabilities need NO
-- schema change. In particular it future-proofs **optional scheduled exports /
-- one-way Google Sheets sync** (Phase 2 §9): such a job reads existing
-- candidate tables and only needs to persist small state — e.g. the last-synced
-- cursor (candidates.updated_at), target spreadsheet id, column selection, and
-- on/off flag — all of which live here as rows. Nothing is scheduled now.
-- =====================================================================

create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  description text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.app_settings;
create trigger set_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Privileges + RLS (admins only; this table never holds candidate-facing data).
grant select, insert, update, delete on public.app_settings to authenticated;
alter table public.app_settings enable row level security;

drop policy if exists app_settings_admin_all on public.app_settings;
create policy app_settings_admin_all on public.app_settings for all to authenticated
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));
