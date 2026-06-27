# Candidate Portal — Validation & E2E Test Plan

**Date:** 2026-06-27
**Method:** Automated checks (typecheck/lint/build) + **code-level end-to-end
review** of every flow. A live browser E2E must be run by you once Supabase is
configured (this environment has no access to your Supabase/Google/Vercel
accounts or a browser driver).

## Automated verification
| Check | Result |
|---|---|
| `npm run typecheck` | ✅ pass |
| `npm run lint` | ✅ 0 problems |
| `npm run build` | ✅ pass (16 routes) |

## Bugs found & fixed (this pass)
| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **Critical** | Auth↔profile **redirect loop**: an authenticated user with no `candidates` row (DB not migrated / trigger failed) bounced `/dashboard`→`/login`→`/dashboard` forever. | `requireCandidate()` now signs the user out and shows `?error=profile_setup` on login instead of looping. |
| 2 | Minor (perf/UX) | Auto-save fired a full `router.refresh()` on every debounced keystroke. | Silent auto-saves no longer refresh; explicit "Save & continue" still does. |
| 3 | Minor (UX) | Login error message was generic. | Specific message for the profile-setup case. |

## Code-level flow review (status)
- **Registration** ✅ — validates, duplicate-checks email+mobile (service-role),
  signs up with metadata, routes to verify-email. *Note:* duplicate detection
  needs the **service-role key**; without it, an existing-confirmed email would
  route to verify-email with no code (mitigated once the key is set).
- **Email verification** ✅ — `verifyOtp(type:"signup")`. **Requires the
  Confirm-signup email template to include `{{ .Token }}`** (else only a link is
  sent and the 6-digit form has nothing to verify).
- **Login** ✅ — handles `email_not_confirmed` → verify-email; generic error
  otherwise; runs super-admin bootstrap.
- **Google login** ✅ — button auto-shows only when enabled; redirects via
  Supabase callback. **Requires the Google redirect URI = Supabase callback**
  (see google-oauth.md).
- **Forgot/Reset password** ✅ — recovery link → `/auth/callback` → `/reset-password`.
- **Onboarding/Profile wizard** ✅ — per-step validation, save-and-continue,
  auto-save, instant list saves; completion% & status update via DB triggers.
- **Resume upload** ✅ — PDF-only + 5 MB enforced client & server; stored at
  `resumes/<uid>/resume.pdf` with folder-isolated RLS; signed-URL view.
- **Dashboard / Profile view** ✅ — completion meter, status, missing-steps.
- **Logout** ✅ — clears session → `/login`.

## Live E2E test script (run after Supabase setup)
Prereqs: migrations applied · service-role key set · Auth Site/Redirect URLs set
· `{{ .Token }}` in the Confirm-signup template · (optional) Google + SMTP.

1. **Register** with a real email + valid 10-digit mobile → lands on verify-email.
2. **Email OTP** — enter the 6-digit code from the email → lands on `/onboarding`.
   - Try a wrong code → friendly error. Try **Resend**.
3. **Duplicate** — register again with the same email and again with the same
   mobile → friendly "already exists" errors.
4. **Onboarding** — fill Personal (leave a field, blur → auto-saves), Continue
   through Education → Skills (add 3) → Experience/Projects → Links → Preferences
   → Resume (upload a PDF; try a >5 MB and a non-PDF → rejected). Watch the
   completion % rise; reach **Profile completed**.
5. **Dashboard** — meter at expected %, status badge correct, candidate ID shown.
6. **Profile view / Edit** — values persisted; edit a section and confirm it saves.
7. **Resume** — View opens the PDF (signed URL); Replace and Remove work.
8. **Logout** → `/login`. **Login** with password → `/dashboard`.
9. **Forgot password** → email link → set a new password → logged in.
10. **Google login** (if configured) → completes via callback → `/dashboard`.
11. **Settings** — change password (wrong current → error; correct → success).
12. **Super-admin** — log in with `SUPER_ADMIN_EMAIL` → role auto-granted
    (verify `user_roles`).

Record results; report any failure here before Milestone 3.

## Outstanding configuration (your accounts — I can't access them)
- [ ] Apply the 8 SQL migrations (SQL Editor) — **blocks everything**.
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` (local + Vercel).
- [ ] Supabase Auth: Site URL + Redirect URLs; `{{ .Token }}` template.
- [ ] Google: redirect URI = Supabase callback; provider enabled (client id+secret).
- [ ] SMTP (Resend/Brevo) connected in Supabase for reliable email.
- [ ] Vercel: env vars + import repo + preview/prod deploy.
