import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { GoogleButton } from "@/features/auth/components/google-button";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { FormAlert } from "@/features/auth/components/form-alert";
import { isGoogleAuthEnabled } from "@/features/auth/server/oauth-providers";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirectedFrom?: string;
    error?: string;
    reason?: string;
  }>;
}) {
  const { redirectedFrom, error, reason } = await searchParams;
  const googleEnabled = await isGoogleAuthEnabled();

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to your Magnus Copo candidate account."
    >
      {error ? (
        <div className="mb-4">
          <FormAlert>
            {error === "profile_setup"
              ? "We couldn't load your profile. Please sign in again."
              : `We couldn't sign you in. ${reason ? `Reason: ${reason}` : "Please try again."}`}
          </FormAlert>
        </div>
      ) : null}
      {googleEnabled ? (
        <div className="mb-4 grid gap-4">
          <GoogleButton label="Log in with Google" />
          <AuthDivider />
        </div>
      ) : null}
      <LoginForm redirectedFrom={redirectedFrom} />
    </AuthCard>
  );
}
