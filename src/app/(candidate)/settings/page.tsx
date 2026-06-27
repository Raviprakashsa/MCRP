import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { requireCandidate } from "@/features/candidate/data";
import { ChangePasswordForm } from "@/features/candidate/components/change-password-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const candidate = await requireCandidate();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="border-border bg-card rounded-2xl border p-6">
        <h2 className="text-base font-semibold">Account</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Candidate ID</dt>
            <dd className="mt-0.5 font-mono">{candidate.candidate_code}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Email</dt>
            <dd className="mt-0.5 flex items-center gap-1.5">
              {candidate.email}
              {candidate.email_verified ? (
                <BadgeCheck
                  className="text-success size-4"
                  aria-label="Verified"
                />
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Mobile</dt>
            <dd className="mt-0.5">{candidate.mobile || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="border-border bg-card rounded-2xl border p-6">
        <h2 className="text-base font-semibold">Change password</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose a strong password you don&apos;t use elsewhere.
        </p>
        <div className="mt-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
