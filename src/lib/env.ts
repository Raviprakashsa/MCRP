import { z } from "zod";

/**
 * Type-safe, validated environment variables.
 *
 * We validate at module load so a misconfigured deployment fails fast with a
 * clear message instead of producing confusing runtime errors deep in the app.
 *
 * Only `NEXT_PUBLIC_*` values live here because they are safe for the browser
 * and are statically inlined by Next.js — which is why each one is referenced
 * explicitly (destructuring `process.env` would break that inlining).
 * Server-only secrets (e.g. the Supabase service-role key) are validated in
 * their own server-only module when first introduced.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  throw new Error(
    `Invalid or missing public environment variables:\n${z.prettifyError(parsed.error)}\n` +
      "Copy .env.example to .env.local and fill in the values (see docs/deployment).",
  );
}

export const env = parsed.data;
export type Env = typeof env;
