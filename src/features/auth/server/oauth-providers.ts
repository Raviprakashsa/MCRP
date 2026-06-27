import "server-only";
import { env } from "@/lib/env";

/**
 * Detects which external OAuth providers are actually enabled in the Supabase
 * project, by reading the public GoTrue settings endpoint. This lets the UI
 * **auto-hide** the Google button when credentials aren't configured — no manual
 * flag required. Result is cached for 5 minutes.
 */
export async function getEnabledOAuthProviders(): Promise<
  Record<string, boolean>
> {
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
      {
        headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return {};
    const data: { external?: Record<string, boolean> } = await res.json();
    return data.external ?? {};
  } catch {
    // Network/parse failure → treat all external providers as unavailable.
    return {};
  }
}

export async function isGoogleAuthEnabled(): Promise<boolean> {
  const external = await getEnabledOAuthProviders();
  return external.google === true;
}
