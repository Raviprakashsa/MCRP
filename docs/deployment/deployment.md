# Deployment Guide (GitHub → Vercel → Hostinger DNS)

**Repo:** `https://github.com/Raviprakashsa/MCRP.git`
**Supabase ref:** `nwpkiwlufqkswnpuigkg`
**Production domain:** `https://careers.magnuscopo.com`

This builds on:
- [`supabase-setup.md`](supabase-setup.md) — database, auth, storage.
- [`google-oauth.md`](google-oauth.md) — Google login config.

---

## 1. Source control (GitHub)
```bash
git add -A
git commit -m "…"
git branch -M main
git remote add origin https://github.com/Raviprakashsa/MCRP.git
git push -u origin main
```
`.gitignore` already excludes `node_modules`, `.next`, and **all `.env*` except
`.env.example`**, so no secrets are committed. Verify before first push:
```bash
git check-ignore .env.local   # → prints ".env.local" (good: it's ignored)
git status                    # confirm no .env.local / keys staged
```

## 2. Local development
```bash
cp .env.example .env.local    # fill in the values (see supabase-setup.md)
npm install
npm run dev                   # http://localhost:3000
```
Run the 8 SQL migrations once against your Supabase project (SQL Editor or
`supabase db push`) — see supabase-setup.md.

## 3. Vercel (production hosting)
1. **Import** the GitHub repo at vercel.com → New Project (framework auto-detected
   as Next.js; `vercel.json` pins region `bom1`/Mumbai).
2. **Environment variables** (Project → Settings → Environment Variables) — set
   for **Production** (and Preview):
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://nwpkiwlufqkswnpuigkg.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your publishable key |
   | `NEXT_PUBLIC_SITE_URL` | `https://careers.magnuscopo.com` |
   | `SUPABASE_SERVICE_ROLE_KEY` | your **secret** key (mark as sensitive) |
   | `SUPER_ADMIN_EMAIL` | `magnuscopo@gmail.com` (optional) |
3. **Deploy.** Every push to `main` redeploys automatically.

## 4. Custom domain (Hostinger DNS → Vercel)
Your main site stays on Hostinger untouched. Point the subdomain:
1. In **Vercel → Project → Settings → Domains**, add `careers.magnuscopo.com`.
   Vercel shows a **CNAME target** (e.g. `cname.vercel-dns.com`).
2. In **Hostinger → Domains → DNS**, add a record:
   - **Type:** CNAME · **Name:** `careers` · **Value:** the Vercel target · **TTL:** default
3. Wait for DNS to propagate; Vercel auto-issues HTTPS.
4. On your Hostinger site, add a **"Careers / Register"** link to
   `https://careers.magnuscopo.com`.

## 5. Post-deploy auth wiring (don't skip)
- **Supabase → Auth → URL Configuration:** Site URL = `https://careers.magnuscopo.com`;
  Redirect URLs include `https://careers.magnuscopo.com/**`.
- **Google Cloud:** JS origin `https://careers.magnuscopo.com`; redirect URI =
  Supabase callback (see google-oauth.md).
- **Email template:** Confirm signup includes `{{ .Token }}` (6-digit OTP).

## 6. Go-live checklist
- [ ] Migrations applied (tables + `skills`/`colleges` seeded).
- [ ] `resumes` storage bucket exists (private, PDF-only).
- [ ] All 5 env vars set in Vercel (service key marked sensitive).
- [ ] Supabase Site URL + Redirect URLs = careers domain.
- [ ] Google redirect URI = Supabase callback; provider enabled.
- [ ] OTP email template uses `{{ .Token }}`.
- [ ] `careers.magnuscopo.com` resolves with HTTPS.
- [ ] Register → verify → login → complete profile → upload resume works end to end.
- [ ] Super-admin email promoted (env bootstrap or SQL).

## Backup & restore (operator)
- **Backups:** Supabase Pro = automatic daily; any tier = manual export via
  `pg_dump` against the direct connection string, plus download the `resumes`
  bucket. Store off-site (your GitHub holds the code; data backups are separate).
- **Restore:** create/select a project, run the migrations, then restore the
  `pg_dump` (`psql < dump.sql`) and re-upload storage objects.
