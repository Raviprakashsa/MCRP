# Google OAuth Configuration & Verification

**Approved production domain:** `https://careers.magnuscopo.com`
**Supabase project ref:** `nwpkiwlufqkswnpuigkg`

> ⚠️ **CRITICAL CORRECTION — read before configuring.**
> With Supabase, Google does **not** redirect to your app's `/auth/callback`.
> Google redirects to **Supabase's** callback, and Supabase then redirects to
> your app. Therefore the **Authorized redirect URI in Google Cloud must be the
> Supabase callback**, not `https://careers.magnuscopo.com/auth/callback`.
>
> The value `https://careers.magnuscopo.com/auth/callback` you listed is correct
> only as a **Supabase Redirect URL allow-list entry** (Layer 2 below) — it must
> **not** be entered in Google Cloud.

## The three configuration layers

### Layer 1 — Google Cloud Console (OAuth client)
**Authorized JavaScript origins** (the app domains that initiate sign-in):
```
http://localhost:3000
https://careers.magnuscopo.com
```
**Authorized redirect URIs** (must be the SUPABASE callback — exactly one):
```
https://nwpkiwlufqkswnpuigkg.supabase.co/auth/v1/callback
```
> Do **not** add `…/auth/callback` app URLs here. Only the Supabase callback.

### Layer 2 — Supabase Dashboard (Auth)
- **Authentication → Providers → Google:** enable, paste the **Client ID** and
  **Client Secret** from Layer 1. (The app auto-shows the Google button once this
  is enabled — no code change.)
- **Authentication → URL Configuration → Redirect URLs** (allow-list the app's
  own callback that Supabase returns to):
  ```
  http://localhost:3000/**
  https://careers.magnuscopo.com/**
  ```
- **Site URL:** `https://careers.magnuscopo.com` (use `http://localhost:3000`
  while testing locally).

### Layer 3 — The app (already implemented, no change)
`signInWithGoogleAction` sends `redirectTo = ${NEXT_PUBLIC_SITE_URL}/auth/callback`,
and `/auth/callback` exchanges the code, runs the super-admin bootstrap, and
redirects to `next` (default `/dashboard`). So set `NEXT_PUBLIC_SITE_URL`
correctly per environment (localhost vs careers domain).

## Flow (why the redirect URI is the Supabase one)
```
App  → signInWithOAuth(redirectTo = SITE_URL/auth/callback)
     → browser sent to Google (Google checks its Authorized redirect URI =
       https://<ref>.supabase.co/auth/v1/callback)
     → Google → Supabase /auth/v1/callback (token exchange)
     → Supabase → app SITE_URL/auth/callback?code=…  (must be in Supabase
       Redirect URLs allow-list)
     → app exchanges code → session → /dashboard
```

## Domain verification result
- ✅ The codebase and all docs use **`careers.magnuscopo.com`** (the earlier
  `register.magnuscopo.com` option was dropped and is not referenced anywhere).
- ⚠️ **Action required:** if your Google OAuth client currently lists any app
  URL (e.g. `…/auth/callback` for any domain, or `register.magnuscopo.com`) as
  an **Authorized redirect URI**, remove it and use only the Supabase callback
  above. Add `careers.magnuscopo.com` (not `register.…`) to JavaScript origins.

## Required changes summary
| Setting | Where | Correct value |
|---|---|---|
| Authorized JavaScript origin (dev) | Google Cloud | `http://localhost:3000` |
| Authorized JavaScript origin (prod) | Google Cloud | `https://careers.magnuscopo.com` |
| Authorized redirect URI | Google Cloud | `https://nwpkiwlufqkswnpuigkg.supabase.co/auth/v1/callback` |
| Redirect URLs allow-list | Supabase | `http://localhost:3000/**`, `https://careers.magnuscopo.com/**` |
| Site URL | Supabase | `https://careers.magnuscopo.com` (or localhost in dev) |
| Client ID + Secret | Supabase → Google provider | from the Google OAuth client |
