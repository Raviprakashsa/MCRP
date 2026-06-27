import type { Metadata } from "next";
import { getProfileBundle, getSkillOptions } from "@/features/candidate/data";
import { ProfileWizard } from "@/features/candidate/components/profile-wizard";

export const metadata: Metadata = { title: "Complete your profile" };

export default async function OnboardingPage() {
  const [bundle, skillOptions] = await Promise.all([
    getProfileBundle(),
    getSkillOptions(),
  ]);

  return (
    <div>
      <div className="mx-auto mb-6 max-w-3xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Complete your profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          It only takes a few minutes — your progress saves automatically.
        </p>
      </div>
      <ProfileWizard
        bundle={bundle}
        skillOptions={skillOptions}
        finishHref="/dashboard"
      />
    </div>
  );
}
