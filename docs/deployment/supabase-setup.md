# Supabase Setup Guide (Milestone 1)

This guide gets your database, authentication, and file storage running. It's written
for a non-technical owner — follow it top to bottom. ~15 minutes.

You only do this once. Everything your app needs is created here.

---

## 1. Create the Supabase project

1. Go to https://supabase.com and sign up (free).
2. Click **New project**.
3. Fill in:
   - **Name:** `magnus-copo-mcrp`
   - **Database password:** click **Generate**, then **save it** in a safe place.
   - **Region:** choose the closest to your users — **`South Asia (Mumbai)`** for India.
   - **Plan:** Free.
4. Click **Create new project** and wait ~2 minutes for it to provision.

---

## 2. Copy your API keys

Open **Project Settings → API** and copy these into your `.env.local` file
(and later into Vercel):

| Supabase field | Goes into env var |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` (keep secret!) |

Also set:
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local, or
  `https://careers.magnuscopo.com` in production.

> The `service_role` key has full access and **bypasses security rules**. Never put it
> in client code or commit it. It only ever lives in server environment variables.

---

## 3. Create the database (run the migrations)

The entire database — tables, indexes, triggers, security rules, storage, and starter
data — is in `supabase/migrations/`, as numbered SQL files. Apply them **in order**.

### Easiest path: SQL Editor (recommended)
In Supabase, open **SQL Editor → New query**, then for **each file in order**:

1. `20260627090100_extensions_and_enums.sql`
2. `20260627090200_tables.sql`
3. `20260627090300_indexes.sql`
4. `20260627090400_functions_triggers.sql`
5. `20260627090500_rls_policies.sql`
6. `20260627090600_storage.sql`
7. `20260627090700_seed.sql`

Open the file, **copy all of it**, paste into the editor, click **Run**. You should see
"Success. No rows returned". Move to the next file. Order matters — don't skip around.

### Alternative path: Supabase CLI (for the technical)
```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```

### Verify it worked
Open **Table Editor**. You should see tables: `candidates`, `candidate_education`,
`skills`, `colleges`, and more. Open `skills` — it should already contain ~60 rows.

---

## 4. Configure authentication

Open **Authentication → Providers / Sign In** and **URL Configuration**:

1. **Email** provider: **enabled**, with **Confirm email = ON** (so verification is
   required). This powers email-OTP verification.
2. **URL Configuration:**
   - **Site URL:** `http://localhost:3000` for testing,
     `https://careers.magnuscopo.com` for production.
   - **Redirect URLs:** add both
     `http://localhost:3000/**` and `https://careers.magnuscopo.com/**`.
3. **6-digit code email template (important):** open **Authentication → Emails →
   Templates → Confirm signup** and make sure the template shows the code by
   including **`{{ .Token }}`** (e.g. "Your verification code is **{{ .Token }}**").
   By default Supabase sends a link; including `{{ .Token }}` gives the 6-digit code
   the app's verify screen expects. Do the same for the **Reset Password** template if
   you prefer codes there (the app uses the link flow for reset by default).
4. **Google login:** the app **auto-shows** the Google button only when this provider
   is enabled — no code change needed. To enable it:
   - In **Google Cloud Console** create an **OAuth 2.0 Client ID** (Web application).
   - Authorized redirect URI: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`.
   - In Supabase **Authentication → Providers → Google**, paste the Client ID + Secret
     and enable it. The button appears automatically; if you skip this, it stays hidden.

### Reliable emails (do this before launch)
Supabase's built-in email sender is rate-limited (a few per hour — fine for testing).
For real OTP/reset emails, connect a free SMTP provider under
**Authentication → Emails → SMTP Settings**:
- **Resend** (3,000 emails/month free) or **Brevo** (300/day free).
- Create an account, get SMTP host/port/user/password, paste them in, set the sender to
  an address on your domain (e.g. `no-reply@magnuscopo.com`).

---

## 5. Confirm storage

Migration 06 already created a private **`resumes`** bucket (PDF-only, 5 MB max). Check
**Storage** — you should see the `resumes` bucket. No action needed.

---

## 6. Make yourself an admin

**Easiest (automatic):** set `SUPER_ADMIN_EMAIL` in your environment to your email.
The **first time that email logs in**, the app automatically grants it the
`super_admin` role — no SQL needed.

**Fallback (manual):** after signing up through the app once, run this in **SQL
Editor** (replace the email):
```sql
update public.user_roles
set role = 'super_admin'
where user_id = (select id from auth.users where email = 'you@magnuscopo.com');
```
Use `role = 'admin'` for staff accounts.

---

## 7. Done

Put the keys in `.env.local`, run `npm run dev`, and the app is connected. The
candidate registration UI and admin panel are built in the next milestones.

Optional: regenerate TypeScript types from your live schema anytime with
`npm run db:types` (after `supabase link`).
