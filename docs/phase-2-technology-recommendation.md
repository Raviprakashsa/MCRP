# Phase 2 — Technology Recommendation

**Project:** Magnus Copo Candidate Registration Portal (MCRP)
**Status:** Phase 2 of 6 — Technology selection with justification
**Last updated:** 2026-06-27

---

## 1. What this project actually needs (the decision criteria)

This portal is genuinely simple in shape. It needs exactly **four backend capabilities**:

1. A **relational, normalized database** (you required this; rules out NoSQL).
2. **Authentication** (candidate register/login/forgot-password + admin login).
3. **File storage** (resume PDF; store the file, keep only the URL in the DB).
4. A way to **browse/export your own data** for peace of mind and CSV/Excel export.

And it must satisfy **your constraints**:

| Constraint | What it means for the choice |
|---|---|
| Non-technical owner, no team | Must be **managed** (no servers to patch/secure). |
| Maintained by you + AI | Must be **heavily represented in AI training data** so AI can fix/regenerate it. |
| Low cost | Must have a **real free tier**, scale to a few ₹thousand/mo only when needed. |
| Own your data | Must be **exportable / portable**, no lock-in. |
| Easy backup/restore | Backups must be **one click or one command**. |
| Scalable later | Must have a clear, **rewrite-free growth path**. |

The single most important and easily-missed criterion for *your* situation is
**AI-friendliness**. Because you'll maintain this with AI, the technology that the AI
models know best and most reliably will save you the most money and pain. That points
hard toward **PostgreSQL + React/Next.js + TypeScript**, which are the most
documented, most-trained-on technologies in their categories.

---

## 2. Backend / Database — full comparison

Scored 1–5 (5 = best) **for this specific simple project and a non-technical owner**.

| Option | Relational | Cost (start) | Maintenance (you+AI) | AI-friendly | Deploy ease | Backup | Security | Future scale | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| **Supabase** (Postgres) | ✅ 5 | Free → $25/mo | 5 (managed) | 5 (Postgres) | 5 | 5 (dump/PITR) | 5 (RLS+Auth) | 5 (any Postgres) | ✅ **RECOMMENDED** |
| Neon (Postgres) | ✅ 5 | Free → ~$19/mo | 3 (DB only) | 5 | 3 | 5 | 3 (DIY auth) | 5 | Great DB, but **no auth/storage** — more to build |
| PocketBase (SQLite) | ✅ 4 | ~₹400/mo VPS | 2 (**self-host**) | 3 | 2 | 5 (copy file) | 3 (you secure) | 3 | Excellent tech, but **you run the server** — wrong for non-technical |
| Appwrite | ✅ 4 | Free → paid | 3 | 3 | 3 | 4 | 4 | 4 | Heavier, more moving parts than needed |
| Firebase (Firestore) | ❌ 1 | Free → usage | 4 | 4 | 5 | 3 | 4 | 4 | **NoSQL** — fails your relational/normalized requirement |
| PlanetScale (MySQL) | ⚠️ 3 | **No free tier** (~$39) | 4 | 4 | 4 | 4 | 4 | 5 | No free tier + no real foreign keys by default |
| Cloudflare D1/R2 | ✅ 4 | Free → cheap | 3 | 3 | 3 | 4 | 4 | 4 | Very cheap & scalable but **DIY auth**, newer, more wiring |
| Raw PostgreSQL (self-host) | ✅ 5 | VPS cost | 1 (**you run it**) | 5 | 2 | 3 | 2 | 5 | Too much ops for a non-technical owner |
| SQLite alone | ✅ 4 | Free | 2 | 4 | 2 | 5 | 3 | 2 | A library, not a platform — you'd build everything |
| MongoDB Atlas | ❌ 1 | Free → usage | 4 | 4 | 4 | 4 | 4 | 4 | **NoSQL** — fails relational/normalized requirement |
| Google Sheets | ❌ 1 | Free | 5 | 2 | 5 | 4 | 1 | 1 | You explicitly rejected it; not a real DB |

### Why Supabase wins for *this* project
- **It bundles all four needs in one managed product:** Postgres database + Auth +
  file Storage + a dashboard where you can literally browse your data like a
  spreadsheet and export it. Every other option makes you assemble 2–3 separate
  services.
- **It IS just PostgreSQL.** That gives you the strongest AI-friendliness (Postgres
  is the most-trained-on database), real relational integrity (foreign keys,
  constraints, indexes — exactly what you asked for), and **zero lock-in**: a
  standard `pg_dump` moves your entire database to Neon, AWS RDS, or your own server
  later with **no rewrite**. This is the "if it breaks I can regenerate/move it" you
  wanted.
- **Backups are trivial:** one-click/scheduled backups on Pro, and `pg_dump` any
  time on free — a single file you can store anywhere.
- **Security is built in:** managed patching, hashed passwords handled by Supabase
  Auth (you never store raw passwords), and **Row Level Security** so a candidate can
  only ever read/edit their own row at the database level — defense in depth.
- **Cost: ₹0 to start.** Free tier comfortably covers your first thousands of
  candidates. You only move to Pro ($25/mo ≈ ₹2,100) when you genuinely outgrow it.

> **Honest caveat:** Supabase **pauses free projects after ~1 week of zero activity**.
> For a live portal with real traffic this won't trigger; if it ever does, one click
> resumes it. Not a concern in practice, but you should know it exists.

---

## 3. Frontend / Application framework — recommendation

**Recommended: Next.js (React) + TypeScript + Tailwind CSS + shadcn/ui**

| Why | Detail |
|---|---|
| **AI-friendly (decisive for you)** | React/Next.js + TypeScript is the **most-represented stack in AI training data**. AI will generate, fix, and regenerate it more reliably than anything else — directly serving your "fixable/regenerable with AI" goal. |
| **One codebase, two faces** | The candidate portal and the admin panel are built in the same app with role-based routing — less to learn, less to maintain. |
| **Type safety** | TypeScript catches errors before runtime — you asked for this. |
| **Fast, modern, responsive** | Server rendering for fast public pages; Tailwind + **shadcn/ui** give a clean, premium, mobile-friendly UI quickly. shadcn components are **copied into your repo (you own them)**, so AI can freely edit them — very AI-friendly. |
| **Trivial deployment** | Deploys on **Vercel** (the company that makes Next.js) with `git push` → live. Free Hobby tier; no servers to manage — right for a non-technical owner. |
| **First-class Supabase support** | Official Supabase + Next.js integration and SSR auth helpers — they're designed to work together. |

**Alternatives considered:** SvelteKit / Remix / plain Vite+React are all fine
technically, but they have **less AI training coverage** and/or more deployment
wiring. For an owner who will lean on AI, Next.js's dominance in AI knowledge is a
real, money-saving advantage — that's why it wins, *not* popularity for its own sake.

---

## 4. The recommended architecture (one diagram in words)

```
Candidate / Admin browser
        │  (HTTPS)
        ▼
Next.js app  ──────────────►  Vercel  (frontend hosting, free → $20/mo)
  • Candidate portal           git push = deploy
  • Admin panel
  • TypeScript + Tailwind + shadcn/ui
        │
        │  supabase-js (secure)
        ▼
Supabase  (free → $25/mo)
  • PostgreSQL   → your normalized candidate database
  • Auth         → register / login / forgot-password / admin (passwords hashed)
  • Storage      → resume PDFs (DB stores only the file URL)
  • Dashboard    → browse + export your data; scheduled backups
```

**Tooling around the code (all standard, AI-friendly):**
- **Zod** for validation (shared between forms and server).
- **React Hook Form** for the multi-step registration form.
- **TanStack Table** for the admin candidate list (search/sort/filter/pagination).
- **ExcelJS / CSV** for exports.
- **GitHub** for the code (free) — also your off-site code backup and how Vercel deploys.

---

## 5. Cost estimate

| Stage | Frontend (Vercel) | Backend (Supabase) | **Total / month** |
|---|---|---|---|
| Launch / first thousands of candidates | Free | Free | **₹0** |
| Steady growth (more storage/traffic) | Free–$20 | $25 | **~₹2,000–₹3,500** |
| Larger scale | $20 | $25+ usage | scales with use; still affordable |

Domain (`careers.magnuscopo.com`) is just a DNS record on your existing domain — no
extra hosting cost. **You can build and launch the entire MVP for ₹0/month.**

---

## 6. How this satisfies every requirement you set

- **Relational, normalized, not Sheets** → PostgreSQL ✅
- **Low cost** → ₹0 to start ✅
- **Easy maintenance (you + AI)** → fully managed + the most AI-known stack ✅
- **Scalability** → Postgres + Vercel scale; rewrite-free move to any Postgres host ✅
- **AI-friendly codebase** → Next.js/TypeScript/Postgres, the best-known stack to AI ✅
- **Easy deployment** → `git push` to Vercel, no servers ✅
- **Easy backup/restore** → `pg_dump` / one-click backups ✅
- **Secure auth, encrypted passwords** → Supabase Auth (hashing handled) + RLS ✅
- **Secure file storage** → Supabase Storage, URL-only in DB ✅
- **Future expansion** → standard, portable, modular ✅

---

## 7. Hosting integration with your Hostinger website

Your main site `https://www.magnuscopo.com` stays exactly where it is on **Hostinger** —
**we do not touch it**. The portal is a separate Next.js app on Vercel, and we simply
point a subdomain at it.

| Option | How it works | Verdict |
|---|---|---|
| **`careers.magnuscopo.com` → Vercel** (subdomain via DNS) | In Hostinger DNS, add one **CNAME** record pointing `careers` to Vercel. Main site untouched. | ✅ **RECOMMENDED** |
| `register.magnuscopo.com` → Vercel | Identical to above, just a different name. | ✅ Fine (pick the name you prefer) |
| `magnuscopo.com/careers` (path on same site) | Requires a **reverse proxy / rewrite**, which is fragile/awkward on Hostinger shared hosting and risks your live site. | ❌ Avoid |

**Recommendation: `careers.magnuscopo.com` as a subdomain pointing to Vercel via a
single CNAME DNS record.** Reasons:
- **Zero risk to your existing site** — the Hostinger site and the portal are fully
  independent; if one has an issue the other is unaffected.
- **Easiest to maintain** — no proxy config, no server. Vercel auto-issues the HTTPS
  certificate for the subdomain.
- You just add a **"Careers / Register"** button on your Hostinger site linking to
  `careers.magnuscopo.com`. That's the whole integration.

> Setup later is ~5 minutes: Vercel shows you the exact CNAME value; you paste it into
> Hostinger's DNS panel. I'll give you click-by-click steps when we deploy.

---

## 8. Authentication recommendation (you prefer OTP)

**Recommended for MVP: Email + Password, with a 6-digit Email OTP to verify the
account at signup, plus "Login with Google" and email-based password reset. Mobile
OTP added later.**

Why this exact combination:
- **Email OTP is free; mobile/SMS OTP is not.** SMS in India needs a paid provider
  (MSG91/Twilio, ~₹0.15–0.25/SMS) **and DLT registration**. For an MVP that's
  recurring cost + setup friction for no real security gain over email OTP.
- **It matches your dashboard.** You listed *Change Password* and *Reset Password* —
  that needs password auth. So: password for login, **email OTP just to verify the
  address at signup** (proves the email is real, kills fake/duplicate signups).
- **"Login with Google" is a free one-click win** — almost every Indian student has a
  Gmail account; it boosts completion and reduces password-reset support for you.
- **Mobile number is still collected** as profile data now; we can add **verified
  mobile OTP later** (one upgrade, no rewrite) once volume/budget justify the SMS cost.

| Method | Cost | UX for students | Security | MVP? |
|---|---|---|---|---|
| **Email + Password + Email OTP verify** | Free | Familiar | Good | ✅ **Yes** |
| **Google login** | Free | Excellent (1 click) | Good | ✅ Yes (optional) |
| Mobile/SMS OTP | Paid + DLT | Excellent | Good | ⏭ Later upgrade |
| Email magic-link only (no password) | Free | Good | Good | Possible, but conflicts with your "Change Password" requirement |

> **Important practical detail:** Supabase's *built-in* email sender is rate-limited
> (a few emails/hour — fine only for testing). For reliable OTP/reset emails in
> production we'll connect a **free transactional email provider** via SMTP —
> **Resend** (3,000 emails/month free) or **Brevo** (300/day free). Still ₹0.
> All of this is handled by **Supabase Auth**, so passwords are hashed for us and we
> never store raw credentials.

**Designed so SMS OTP can be switched on later without re-architecting.** The app
will not call any OTP provider directly. Instead OTP delivery sits behind a small
**provider-agnostic interface** (e.g. `OtpChannel` with `sendCode()` /
`verifyCode()`). The MVP ships an `EmailOtpChannel`; enabling phone later is just
adding a `SmsOtpChannel` (MSG91/Twilio) and a config flag — **no changes to forms,
pages, database, or business logic.** This is exactly your "enable SMS later without
changing the application architecture" requirement.

---

## 9. Excel / Google Sheets — kept as an export & backup layer (not the database)

Supabase PostgreSQL is the **single source of truth**. Excel/Sheets are kept as a
**downstream export and reporting/backup layer** — never as the primary store. This
gives you the spreadsheet comfort you're used to without the duplication problems.

- **Export to CSV / Excel anytime** — built into the admin panel (filtered or full
  candidate list). Always available, no setup. This is the primary "work in Excel" path.
- **Optional one-way auto-sync to Google Sheets** — a scheduled job pushes selected
  candidate columns **from the database into a Google Sheet** for reporting/backup.
  - **One-way only** (DB → Sheet). The Sheet is read-only output; edits there never
    flow back, so there is no duplicate-source-of-truth problem.
  - **Optional & toggleable** — off by default, enabled with a Google service-account
    key and a config flag. Built behind a small interface so it can be added later
    without touching the rest of the app.
  - Implementation later via a scheduled serverless function (Vercel Cron) calling
    the Google Sheets API. Free at your volume.

---

## 10. Deployment & ownership documentation (committed deliverables)

Because you'll run this yourself with AI, these operator guides are **first-class
deliverables**, produced at deployment (Phase 6) and kept in `docs/deployment/`:

1. **Supabase setup guide** — create project, run schema, configure Auth (email OTP),
   create the resume Storage bucket + access rules, connect the free SMTP provider.
2. **Vercel deployment guide** — connect GitHub repo, set env vars, deploy, custom domain.
3. **Hostinger DNS setup** — exact CNAME record to point `careers.magnuscopo.com` at
   Vercel, with screenshots, plus adding the "Careers" link on the main site.
4. **Environment variable reference** — every key (Supabase URL/keys, SMTP, optional
   Google Sheets), what it is, where to get it, and a `.env.example` template.
5. **Backup & restore procedure** — scheduled Supabase backups + manual `pg_dump`
   export and how to restore; storage (resume) backup notes.
6. **One-click / repeatable deploy doc** — a single checklist to go from zero to live,
   and how to redeploy after changes (just `git push`).

---

## 11. Final locked architecture

| Layer | Choice |
|---|---|
| Frontend | **Next.js + TypeScript + Tailwind + shadcn/ui** |
| Hosting | **Vercel** |
| Domain | **`careers.magnuscopo.com`** (CNAME from Hostinger) |
| Database | **Supabase PostgreSQL** (single source of truth) |
| Authentication | **Email + Password + Email OTP**, Google login optional; **OTP behind a provider-agnostic interface** so SMS can be enabled later without re-architecting |
| File storage | **Supabase Storage** (resume PDF; DB stores URL only) |
| Exports | **Excel + CSV** anytime from admin |
| Optional sync | **Google Sheets** (one-way DB → Sheet, optional, toggleable) |
| Website integration | Existing **Hostinger** site links to the portal; main site untouched |
| Launch cost | **₹0/month** |

---

## 12. Next step

Architecture is locked. Proceeding to **Phase 3 — Database Schema Design**: tables,
relationships, normalization, indexes, naming conventions, and the ER diagram,
designed for clean search/filter today and easy growth later.
