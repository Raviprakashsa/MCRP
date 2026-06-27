# Module 1 — Foundation (Milestone 1)

**Status:** Code complete & verified locally. Database/auth go live once you complete
[`supabase-setup.md`](deployment/supabase-setup.md).
**Built:** 2026-06-27

---

## What was built

A production-ready Next.js foundation plus the complete database, wired to Supabase,
with the brand design system and auth infrastructure in place.

- **App scaffold:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (strict),
  Tailwind CSS v4, shadcn/ui, ESLint 9, Prettier.
- **Design system:** `globals.css` carries the real Magnus Copo tokens (light + dark)
  extracted from the live site; Inter font; light/dark theming via `next-themes`;
  theme-aware official `Logo`; `ThemeToggle`.
- **App shell:** public layout (header + footer) and an on-brand landing page at `/`.
- **Environment:** Zod-validated env (`lib/env.ts`) — fails fast with a clear message.
- **Supabase integration:** browser client, server client, and the Proxy session
  helper; `proxy.ts` refreshes the session and protects candidate/admin routes.
- **Database (full Phase 3 schema):** 7 ordered SQL migrations — extensions + enums,
  12 tables, indexes (incl. trigram search), triggers (candidate code, updated_at,
  profile-completion + registration-status engine, new-user provisioning, email-verify
  sync), RLS policies, a private `resumes` storage bucket, and seed data.

## Why (key decisions)

- **Next.js + Supabase + Vercel:** locked in Phase 2 — managed, low-cost, AI-friendly,
  own-your-data. (See `phase-2`.)
- **Tailwind v4 + shadcn/ui:** components are copied into the repo (we own them); tokens
  map 1:1 to the brand system.
- **`next-themes`, `lucide-react`, `zod`:** the only added runtime deps — each earns its
  place (theming, the single icon set, validation reused app-wide). No heavier UI or
  state libraries pulled in.
- **CSS-based logo/theme swap:** avoids hydration flashes and a `useEffect`/`setState`
  pattern (which React 19's lint flags).

## Folder structure changes

New: `src/components/shared/`, `src/features/{auth,candidate,admin}/`, `src/config/`,
`src/types/`, `src/lib/supabase/`, `src/app/(public)/`, `supabase/migrations/`,
`public/brand/`, `docs/deployment/`. The default `src/app/page.tsx` was replaced by
`src/app/(public)/page.tsx`. `middleware.ts` → `proxy.ts` (Next 16 rename).

## Environment variable changes

New file `.env.example` (committed) documents all four variables:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`. Copy to `.env.local` (git-ignored) and fill in.

## Database changes

Everything in `supabase/migrations/`. Applies the locked Phase 3 schema. Two
implementation reconciliations (same behaviour as the design, flagged here):
1. **Case-insensitive uniqueness** uses `lower(...)` unique indexes instead of the
   `citext` type — avoids extension/search-path coupling.
2. **`candidates.mobile` is nullable** so Google/OAuth sign-ups (no mobile at signup)
   can register and add it during onboarding. Duplicate detection is preserved by the
   UNIQUE constraint (multiple NULLs allowed; provided numbers can't duplicate). The
   email/password registration form will still require mobile at the app level.

## Commands executed

```bash
npx create-next-app@latest …            # scaffold (Next 16, TS, Tailwind, ESLint, src)
npm install @supabase/supabase-js @supabase/ssr zod next-themes lucide-react
npm install -D prettier prettier-plugin-tailwindcss
npx shadcn@latest init -d -y            # shadcn/ui (button + utils + tokens)
npm run typecheck && npm run lint && npm run build   # all pass
```

## Verification (self-review)

| Check | Result |
| --- | --- |
| `npm run typecheck` | ✅ pass |
| `npm run lint` | ✅ pass (0 problems) |
| `npm run build` | ✅ pass (no warnings; Proxy detected) |
| `npm run format` | ✅ applied |
| Security | RLS on all tables; passwords handled by Supabase Auth; service-role key server-only; PDF-only + 5 MB storage; env validated |
| Performance | Static landing; RLS uses cached `auth.uid()` init-plan; FK + filter + trigram indexes in place |

## Manual testing checklist

Code-level (now):
- [ ] `npm install` succeeds.
- [ ] `npm run dev` starts; `/` shows the branded landing page.
- [ ] Toggling the theme switches light/dark and swaps the logo.
- [ ] Visiting `/dashboard` while signed out redirects to `/login` (after Supabase env
      is set; without it the app intentionally errors with a clear env message).

After Supabase setup (see the setup guide):
- [ ] All 7 migrations run without error.
- [ ] `skills` table has ~60 rows; `colleges` has 10.
- [ ] Table Editor shows all 12 tables.
- [ ] `resumes` storage bucket exists (private, PDF-only).
- [ ] Promoting a user in `user_roles` to `super_admin` works.

## Known issues / notes

- The app requires the four env vars to be set; with placeholders it builds but won't
  reach a real database (expected until you finish the Supabase setup).
- Vercel / Hostinger DNS / backup-restore guides are produced in **Milestone 4**
  (deployment). `vercel.json` (region `bom1`) is included now.

## Best practices applied

Strict TypeScript, Zod validation, RLS-first security, clean feature-based structure,
owned UI components, single design-token source, no placeholder/TODO code.

---

## Recommended Git commit

```
chore: scaffold MCRP foundation (Module 1)

Next.js 16 + TS + Tailwind v4 + shadcn/ui app with the Magnus Copo design
system (light/dark, official logos), env validation (Zod), Supabase browser/
server/proxy clients with route protection, and the full Phase 3 database as
ordered SQL migrations (schema, indexes, triggers, RLS, storage, seed).

Docs: README, Module 1 report, Supabase setup guide.
```

No breaking changes (initial commit of the application).
