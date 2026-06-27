import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { GoogleButton } from "@/features/auth/components/google-button";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { isGoogleAuthEnabled } from "@/features/auth/server/oauth-providers";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage() {
  const googleEnabled = await isGoogleAuthEnabled();

  return (
    <AuthCard
      title="Create your account"
      description="Register to build your Magnus Copo candidate profile."
    >
      {googleEnabled ? (
        <div className="mb-4 grid gap-4">
          <GoogleButton />
          <AuthDivider />
        </div>
      ) : null}
      <RegisterForm />
    </AuthCard>
  );
}
