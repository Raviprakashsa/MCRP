# Magnus Copo — Candidate Registration Portal (MCRP)

A secure, modern portal where candidates register, verify their email, complete a
structured profile, and upload a resume — replacing scattered Google Forms / Sheets /
Excel with one normalized PostgreSQL database. Admins can search, filter, view, edit,
disable, and export candidates.

This is **not** an ATS/CRM. Recruitment and company management live in the separate
**MMD** system.

## Tech stack

| Layer      | Technology                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| Framework  | Next.js (App Router) + React + TypeScript                                             |
| Styling    | Tailwind CSS v4 + shadcn/ui                                                           |
| Backend    | Supabase — PostgreSQL + Auth + Storage                                                |
| Hosting    | Vercel (app) · Supabase (data) · Hostinger (existing site → `careers.magnuscopo.com`) |
| Validation | Zod                                                                                   |

Full rationale and design are in [`docs/`](docs) (Phases 1–4 + implementation contract).

## Getting started (local)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your environment file and fill in Supabase values:
   ```bash
   cp .env.example .env.local
   ```
   See [`docs/deployment/supabase-setup.md`](docs/deployment/supabase-setup.md) for
   where to find each value and how to run the database migrations.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Scripts

| Script              | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the dev server                               |
| `npm run build`     | Production build                                   |
| `npm run start`     | Run the production build                           |
| `npm run lint`      | ESLint                                             |
| `npm run typecheck` | TypeScript (no emit)                               |
| `npm run format`    | Prettier write                                     |
| `npm run db:types`  | Generate DB types from the linked Supabase project |

## Project structure

```
src/
  app/
    (public)/        Public pages (landing, auth) + public layout
    layout.tsx       Root layout (Inter font, ThemeProvider, metadata)
    globals.css      Tailwind + Magnus Copo design tokens (light/dark)
  components/
    ui/              shadcn/ui primitives (owned)
    shared/          Logo, ThemeToggle, ThemeProvider, header, footer
  features/          Feature modules (auth, candidate, admin) — built per module
  lib/
    env.ts           Validated environment variables (Zod)
    supabase/        Browser + server clients, proxy session helper
    utils.ts         cn() helper
  config/            site.ts
  types/             Shared types (DB types generated via db:types)
  proxy.ts           Next.js Proxy: session refresh + route protection
supabase/
  migrations/        Ordered SQL: schema, indexes, triggers, RLS, storage, seed
docs/                Phases 1–4, implementation contract, module + deploy docs
public/brand/        Official Magnus Copo logos (light/dark)
```

## Database

The schema (12 tables, enums, triggers, RLS, storage) is defined as ordered SQL in
[`supabase/migrations/`](supabase/migrations). Apply it to your Supabase project by
following [`docs/deployment/supabase-setup.md`](docs/deployment/supabase-setup.md).
