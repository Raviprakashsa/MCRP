import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureSuperAdmin } from "@/features/auth/server/bootstrap-super-admin";

/**
 * OAuth / recovery callback. Exchanges the `code` for a session, runs the
 * env-based super-admin bootstrap, then redirects to `next` (a same-site path).
 * Used by Google sign-in and the password-recovery link.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirects: only allow same-site paths.
  const next = nextParam.startsWith("/") ? nextParam : "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  /** Build the final redirect URL respecting proxies. */
  function buildRedirect(path: string): string {
    if (isLocal) return `${origin}${path}`;
    if (forwardedHost) return `https://${forwardedHost}${path}`;
    return `${origin}${path}`;
  }

  // If the provider/Supabase returned an error (no code is issued in that case),
  // surface the real reason instead of a generic "no_code".
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) {
    console.error("[auth/callback] provider error:", providerError);
    return NextResponse.redirect(
      buildRedirect(
        `/login?error=auth&reason=${encodeURIComponent(providerError)}`,
      ),
    );
  }

  if (!code) {
    console.error("[auth/callback] No code parameter in URL");
    return NextResponse.redirect(
      buildRedirect("/login?error=auth&reason=no_code"),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(
      buildRedirect(`/login?error=auth&reason=${encodeURIComponent(error.message)}`),
    );
  }

  if (!data.user) {
    console.error("[auth/callback] No user returned after code exchange");
    return NextResponse.redirect(
      buildRedirect("/login?error=auth&reason=no_user"),
    );
  }

  // Best-effort super-admin bootstrap — never block login if it fails.
  try {
    await ensureSuperAdmin(data.user.id, data.user.email);
  } catch (e) {
    console.error("[auth/callback] ensureSuperAdmin failed:", e);
  }

  return NextResponse.redirect(buildRedirect(next));
}

