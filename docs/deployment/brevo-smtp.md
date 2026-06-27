# Brevo SMTP → Supabase (transactional email)

Gives reliable delivery of verification (OTP) and password-reset emails. Free
tier = 300 emails/day. ~10 minutes.

## 1. Create a Brevo account
- Sign up at https://www.brevo.com (free). Verify your account email.

## 2. Verify a sender (so email isn't rejected/spam)
Brevo → **Senders, Domains & Dedicated IPs → Senders → Add a sender**.
- **Quick start:** add a single sender email you control (e.g. `magnuscopo@gmail.com`)
  and click the verification link Brevo emails you.
- **Best for production:** Brevo → **Domains → Authenticate a domain** for
  `magnuscopo.com`, then add the **SPF + DKIM DNS records** it shows into
  **Hostinger → DNS**. Then send as `no-reply@magnuscopo.com`. (Better
  deliverability; do this before launch.)

## 3. Get SMTP credentials
Brevo → top-right menu → **SMTP & API → SMTP** tab. Note:
- **SMTP server:** `smtp-relay.brevo.com`
- **Port:** `587`
- **Login:** the login shown there (your Brevo account email or a
  `…@smtp-brevo.com` login)
- **Password:** click **Generate a new SMTP key** → copy it (this is the SMTP
  password, not your account password).

## 4. Configure Supabase
Supabase → **Authentication → Emails → SMTP Settings → Enable Custom SMTP**:
| Field | Value |
|---|---|
| Sender email | your **verified** sender (e.g. `no-reply@magnuscopo.com` or `magnuscopo@gmail.com`) |
| Sender name | `Magnus Copo` |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | your Brevo SMTP **login** (step 3) |
| Password | your Brevo **SMTP key** (step 3) |
| Minimum interval | leave default |
**Save.**

## 5. Raise the email rate limit
Supabase → **Authentication → Rate Limits → "Rate limit for sending emails"** →
increase (e.g. `100`/hour). The default is very low and meant for the built-in
sender.

## 6. Confirm the OTP template still has the code
Supabase → **Authentication → Emails → Templates → Confirm signup** → body
includes **`{{ .Token }}`** (so the 6-digit code is delivered).

## 7. Test
- Register a new candidate → the verification email should arrive within seconds
  (check spam the first time). Enter the 6-digit code.
- Trigger **Forgot password** → reset email should arrive.
- If nothing arrives: Brevo → **Logs / Transactional → Email** shows the send
  attempt + any rejection reason; Supabase → **Logs → Auth** shows SMTP errors.

## Notes
- These SMTP credentials are entered **only in the Supabase dashboard** — they are
  **not** app environment variables and never go in the repo.
- Gmail/free-domain senders can land in spam due to DMARC; authenticating
  `magnuscopo.com` (step 2) is the real fix before launch.
