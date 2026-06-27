"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { ensureSuperAdmin } from "@/features/auth/server/bootstrap-super-admin";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "@/features/auth/schemas";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: boolean;
  message?: string;
};

/** Normalise an Indian mobile to its 10-digit form (drop a +91 prefix). */
function normaliseMobile(value: string): string {
  return value.replace(/^\+91/, "").trim();
}

// ---------------------------------------------------------------------------
// Register (email + password) → email OTP verification
// ---------------------------------------------------------------------------
export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    whatsapp: formData.get("whatsapp") ?? "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { full_name, email, password } = parsed.data;
  const mobile = normaliseMobile(parsed.data.mobile);
  const whatsapp = parsed.data.whatsapp
    ? normaliseMobile(parsed.data.whatsapp)
    : null;

  // Friendly duplicate detection (admin client bypasses RLS for this check).
  const admin = createAdminClient();
  const [{ data: emailHit }, { data: mobileHit }] = await Promise.all([
    admin.from("candidates").select("id").eq("email", email).maybeSingle(),
    admin.from("candidates").select("id").eq("mobile", mobile).maybeSingle(),
  ]);
  if (emailHit) {
    return {
      fieldErrors: {
        email: ["An account with this email already exists. Try logging in."],
      },
    };
  }
  if (mobileHit) {
    return {
      fieldErrors: {
        mobile: ["An account with this mobile already exists. Try logging in."],
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, mobile, whatsapp },
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

// ---------------------------------------------------------------------------
// Verify email via 6-digit OTP
// ---------------------------------------------------------------------------
export async function verifyEmailAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = verifyOtpSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });

  if (error || !data.user) {
    return { error: "That code is invalid or has expired. Request a new one." };
  }

  await ensureSuperAdmin(data.user.id, data.user.email);
  redirect("/onboarding");
}

export async function resendOtpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  if (!z.email().safeParse(email).success) {
    return { error: "Missing email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { error: error.message };
  return { success: true, message: "A new code has been sent to your email." };
}

// ---------------------------------------------------------------------------
// Login (email + password)
// ---------------------------------------------------------------------------
export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const redirectTo =
    String(formData.get("redirectedFrom") ?? "") || "/dashboard";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
    }
    return { error: "Invalid email or password." };
  }

  await ensureSuperAdmin(data.user.id, data.user.email);
  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}

// ---------------------------------------------------------------------------
// Forgot password → email a recovery link
// ---------------------------------------------------------------------------
export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  // Always report success to avoid revealing whether an account exists.
  return {
    success: true,
    message: "If that email is registered, a reset link is on its way.",
  };
}

// ---------------------------------------------------------------------------
// Reset password (requires an active recovery session from the callback)
// ---------------------------------------------------------------------------
export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your reset link has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------
export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
      flowType: "pkce",
    },
  });

  if (error || !data.url) {
    redirect("/login?error=google");
  }

  redirect(data.url);
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
