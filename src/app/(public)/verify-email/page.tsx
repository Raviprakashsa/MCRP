import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/register");

  return (
    <AuthCard
      title="Verify your email"
      description={`Enter the 6-digit code we sent to ${email}.`}
    >
      <VerifyEmailForm email={email} />
    </AuthCard>
  );
}
