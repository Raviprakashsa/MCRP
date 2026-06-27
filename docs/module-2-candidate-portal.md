# Milestone 2 — Candidate Portal

**Status:** Complete & verified (typecheck, lint, build all pass).
**Built:** 2026-06-27

## What was built
The full candidate-facing portal on top of the Milestone 1 foundation.

### Authentication (email/password + email OTP + Google + recovery)
- Register → **6-digit email OTP** verify → login → forgot/reset password → sign out.
- **Google login**, auto-shown only when the provider is enabled in Supabase
  (detected via the public settings endpoint — no manual flag, no secret in app).
- **Duplicate detection** on email *and* mobile (friendly pre-submit messages via
  the service-role admin client; DB unique constraints are the backstop).
- **Env-based super-admin bootstrap** (`SUPER_ADMIN_EMAIL`) on first login.

### Candidate area (`/(candidate)` route group, auth-guarded)
- **Dashboard** — profile-completion meter, registration-status badge, prioritized
  "next steps", candidate ID, quick links.
- **Onboarding wizard & profile editor** (same component, `/onboarding` and
  `/profile/edit`) — 7 steps: Personal → Education → Skills → Experience/Projects →
  Links → Preferences → Resume. Features:
  - **Progressive disclosure** (one step at a time, mobile-first; native selects/
    date pickers for mobile).
  - **Per-step validation** (React Hook Form + Zod, re-validated server-side).
  - **Save-and-continue** + **debounced auto-save** on single-record steps; list
    steps (skills/projects/experience/links) save instantly on add/remove.
  - **Automatic profile completion + registration status** via the DB triggers;
    UI refreshes after each save.
- **Profile view** (read-only, sectioned) and **Resume** (PDF upload/replace/view
  via signed URL, 5 MB limit, Supabase Storage with folder isolation).
- **Settings** — change password (verifies current password first).

## Architecture / decisions
- Server Actions for all writes; Zod validation on both client and server.
- Reads typed via domain models (`features/candidate/types.ts`) + `.returns<T>()`.
- New deps (justified): `react-hook-form`, `@hookform/resolvers` (multi-step forms
  with per-field validation), plus shadcn primitives (select, textarea, checkbox,
  progress, badge, separator, dropdown-menu, tabs).
- No architecture/DB/UI/locked decisions changed.

## Security review (this milestone)
- Service-role key used **only** in `server-only` modules (`env.server.ts`,
  `supabase/admin.ts`) and server actions; never `NEXT_PUBLIC`. ✅
- Only public values are `NEXT_PUBLIC_*`; validated in `env.ts`. ✅
- RLS on every table; storage policies isolate each candidate's folder. ✅
- Open-redirect guards on `/auth/callback` and post-login redirect. ✅
- Change-password verifies the current password before updating. ✅
- CSRF handled by Next Server Actions; `getUser()` revalidates sessions in Proxy. ✅
- Low-risk note: `mapDbError` surfaces `error.message` for unhandled DB errors —
  consider fully generic messages in production hardening (Milestone 4).

## Verification
| Check | Result |
|---|---|
| `npm run typecheck` | ✅ pass |
| `npm run lint` | ✅ 0 problems |
| `npm run build` | ✅ pass (16 routes) |
| Functional | Requires live Supabase (migrations + secret key); see deployment docs |

## Recommended commit
```
feat: candidate portal (Milestone 2) + Supabase/GitHub/Google config

Auth (email+password, 6-digit email OTP, Google auto-detect, forgot/reset,
duplicate detection, super-admin bootstrap), candidate dashboard, onboarding/
profile wizard (per-step validation, save-and-continue, autosave), profile
view, resume upload (Storage), settings/change-password. Adds deployment +
Google OAuth + env docs. No locked decisions changed.
```
