import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProfileBundle, getSkillOptions } from "@/features/candidate/data";
import { ProfileWizard } from "@/features/candidate/components/profile-wizard";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const [bundle, skillOptions] = await Promise.all([
    getProfileBundle(),
    getSkillOptions(),
  ]);

  return (
    <div>
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
        <Link
          href="/profile"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft /> Back to profile
        </Link>
      </div>
      <ProfileWizard
        bundle={bundle}
        skillOptions={skillOptions}
        finishHref="/profile"
      />
    </div>
  );
}
