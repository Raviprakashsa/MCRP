# MCRP — Setup From Scratch (Local, Working End-to-End)

Follow top to bottom. Your project values are filled in. Each part has a
**✓ Check** so you know it worked before moving on.

- **Supabase project ref:** `nwpkiwlufqkswnpuigkg`
- **Project URL:** `https://nwpkiwlufqkswnpuigkg.supabase.co`
- **Supabase OAuth callback (for Google):** `https://nwpkiwlufqkswnpuigkg.supabase.co/auth/v1/callback`
- **Local app URL:** `http://localhost:3000`

---

## PART A — Database (do this first)
1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Open `supabase/migrations/` in the project and run the **8 files in order**,
   one at a time (paste → **Run**, wait for "Success", next):
   1. `20260627090100_extensions_and_enums.sql`
   2. `20260627090200_tables.sql`
   3. `20260627090300_indexes.sql`
   4. `20260627090400_functions_triggers.sql`
   5. `20260627090500_rls_policies.sql`
   6. `20260627090600_storage.sql`
   7. `20260627090700_seed.sql`
   8. `20260627090800_app_settings.sql`

**✓ Check:** Table Editor shows `candidates`, `skills` (~60 rows), `colleges`
(10 rows). Storage shows a private **`resumes`** bucket.

---

## PART B — Keys → `.env.local`
1. Supabase → **Project Settings → API**. Copy:
   - **Project URL**
   - **anon / publishable** key (`sb_publishable_…`)
   - **service_role / secret** key (`sb_secret_…`)  ← keep secret
2. In the project root, ensure `.env.local` has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://nwpkiwlufqkswnpuigkg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ETNlqd2dgWE503D6hdBvlw_vUXqiQbY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_SERVICE_ROLE_KEY=<paste your sb_secret_ key here>
   SUPER_ADMIN_EMAIL=magnuscopo@gmail.com
   ```

**✓ Check:** `SUPABASE_SERVICE_ROLE_KEY` is a real `sb_secret_…` value (not the
placeholder).

---

## PART C — Supabase Auth settings
Supabase → **Authentication**:
1. **Providers → Email:** Enabled, **Confirm email = ON**.
2. **URL Configuration:**
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** add `http://localhost:3000/**`
3. **Emails → Templates → Confirm signup:** make sure the body shows the code,
   e.g. include **`Your verification code is {{ .Token }}`**. (Default sends only a
   link; the app's verify screen expects the 6-digit code.)
4. *(Recommended for real emails)* **Emails → SMTP Settings:** connect Resend or
   Brevo (free). For first local tests you can skip this and read the code from
   Supabase → **Logs → Auth** instead.

**✓ Check:** Confirm-signup template contains `{{ .Token }}`.

---

## PART D — Google login (clean setup)
> The earlier "Unable to exchange external code" = Google rejected Supabase's
> token request = the **Client ID/Secret pair** or **consent screen**. A fresh
> client fixes it reliably.

### D1. OAuth consent screen (once)
Google Cloud Console → **APIs & Services → OAuth consent screen**:
- User type **External** → create.
- App name, support email, developer email → save through.
- **Test users:** add `magnuscopo@gmail.com` (and any email you'll test with).
  *(Or click **Publish app** to allow anyone.)*

### D2. Create the OAuth client
**APIs & Services → Credentials → Create Credentials → OAuth client ID:**
- Application type: **Web application**
- **Authorized JavaScript origins:** `http://localhost:3000`
- **Authorized redirect URIs:** `https://nwpkiwlufqkswnpuigkg.supabase.co/auth/v1/callback`
  *(this Supabase URL — NOT your app URL)*
- **Create** → copy the **Client ID** and **Client secret** (`GOCSPX-…`).

### D3. Put them in Supabase
Supabase → **Authentication → Providers → Google:**
- Enable, paste the **Client ID** and **Client Secret** from the **same** client
  in D2, **Save**.

**✓ Check:** both fields filled from the *same* client; wait ~1 minute.

---

## PART E — Run the app
```bash
npm install
npm run dev
```
Open `http://localhost:3000`. (Restart `npm run dev` after any `.env.local` change.)

---

## PART F — Test (in an incognito window)
1. **Register** → enter the 6-digit code (from email, or Supabase → Logs → Auth)
   → lands on the profile wizard.
2. **Google login** → completes → dashboard.
3. Complete profile → upload resume (PDF) → check completion %.
4. Logout → login → forgot password.
5. Log in with `magnuscopo@gmail.com` → it's auto-promoted to **super_admin**.

**If anything fails:** the login page shows `Reason: …`, and Supabase → **Logs →
Auth** shows the exact cause. Send me that line.

---

## Common gotchas (quick map)
| Symptom | Cause → fix |
|---|---|
| `Unable to exchange external code` | Google **Client Secret** mismatch, or consent screen testing without your email as a test user → redo Part D with a fresh client + add test user. |
| `redirect_uri_mismatch` (Google screen) | Google **Authorized redirect URI** isn't the Supabase callback (Part D2). |
| Logged in but profile error | Migrations not applied → Part A. |
| No 6-digit code in email | Template missing `{{ .Token }}` → Part C3. |
| `requires_recovery` / reset link dead | Redirect URLs missing `http://localhost:3000/**` → Part C2. |
