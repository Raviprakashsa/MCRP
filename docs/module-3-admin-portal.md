# Milestone 3 — Admin Portal

**Status:** Complete & verified (typecheck, lint, build all pass).
**Built:** 2026-06-27

## What was built
A role-gated admin area (`/admin`) for managing candidates. Access is restricted
to `admin`/`super_admin` via `requireAdmin()` and enforced at the DB by RLS.

### Part 1 — Foundation
- **Auth/role guard** (`requireAdmin`, `getRole`) + guarded `(admin)` route group
  with its own header/nav (Dashboard · Candidates · Audit) + account menu.
- **Dashboard** — stat cards: total candidates, profiles completed, resumes
  uploaded, new this week.
- **Candidate list** — global search (name/email/mobile/ID), pagination, columns
  for college/branch/year/completion/status, with input sanitization.
- **Candidate detail** (read-only) — all profile sections + resume view via an
  admin signed URL.

### Part 2 — Actions, export, audit, advanced filters
- **Edit candidate** — admin edits the personal/contact fields (Zod-validated,
  audit-logged).
- **Disable / Enable** and **soft Delete** — `status` toggle and `deleted_at`
  (recoverable; deleted rows hidden from the list). Each writes an **audit log**.
- **CSV + Excel export** — `/admin/candidates/export?format=csv|xlsx` streams the
  current filtered result (flattened with primary education), Excel via ExcelJS.
- **Audit logs** page — who/what/when, linking back to the candidate.
- **Advanced filters** — college, branch, skill, passing year (resolved via
  related-table id intersection), plus status/stage/city/state.

## Security
- Every admin action re-checks the role server-side and is constrained by RLS.
- Export and audit endpoints verify `admin`/`super_admin` before returning data.
- Audit inserts set `actor_id = auth.uid()` (enforced by the audit RLS policy).
- Soft delete (not hard delete) keeps data recoverable and audit-safe.

## New dependency
- `exceljs` — `.xlsx` generation for the Excel export (server route only).

## Verification
| Check | Result |
|---|---|
| `npm run typecheck` | ✅ pass |
| `npm run lint` | ✅ 0 problems |
| `npm run build` | ✅ pass (admin routes incl. export + audit) |
| Functional | Log in as `magnuscopo@gmail.com` (super_admin) → `/admin` |

## Routes
`/admin` · `/admin/candidates` · `/admin/candidates/[id]` ·
`/admin/candidates/[id]/edit` · `/admin/candidates/export` · `/admin/audit`

## Not in scope (matches approved design)
No company/job/ATS/CRM/training/analytics modules — those live in MMD. The admin
portal is candidate data management only.
