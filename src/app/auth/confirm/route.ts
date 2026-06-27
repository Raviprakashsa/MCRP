import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email confirmation route for Supabase PKCE / magic-link flows.
 *
 * When Supabase sends a confirmation email (signup, recovery, invite, etc.),
 * the link points here with `token_hash` and `type` query params. This route
 * verifies the token and then redirects to the appropriate page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  // Prevent open redirects
  const redirectTo = next.startsWith("/") ? next : "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Verified successfully — redirect to the target page
      return NextResponse.redirect(
        new URL(redirectTo, request.url),
      );
    }
  }

  // If verification failed, redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=auth", request.url),
  );
}
