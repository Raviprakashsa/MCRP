import type { ProfileBundle, RegistrationStatus } from "./types";

export const registrationStatusMeta: Record<
  RegistrationStatus,
  { label: string; tone: "muted" | "info" | "success" }
> = {
  registered: { label: "Registered", tone: "muted" },
  email_verified: { label: "Email verified", tone: "info" },
  profile_started: { label: "Profile started", tone: "info" },
  resume_uploaded: { label: "Resume uploaded", tone: "info" },
  profile_completed: { label: "Profile completed", tone: "success" },
};

export type MissingSection = { label: string; href: string };

/** What the candidate still needs to do, in priority order. */
export function computeMissingSections(bundle: ProfileBundle): MissingSection[] {
  const { candidate, education, skills, projects, experiences, links, preferences, resume } =
    bundle;
  const missing: MissingSection[] = [];

  const personalDone =
    candidate.full_name &&
    candidate.mobile &&
    candidate.city &&
    candidate.state &&
    candidate.date_of_birth &&
    candidate.gender;

  if (!personalDone) {
    missing.push({ label: "Complete your personal details", href: "/profile/edit" });
  }
  if (education.length === 0) {
    missing.push({ label: "Add your education", href: "/profile/edit" });
  }
  if (skills.length < 3) {
    missing.push({ label: "Add at least 3 skills", href: "/profile/edit" });
  }
  if (!resume) {
    missing.push({ label: "Upload your resume (PDF)", href: "/resume" });
  }
  if (projects.length === 0 && experiences.length === 0) {
    missing.push({
      label: "Add a project or experience",
      href: "/profile/edit",
    });
  }
  if (links.length === 0) {
    missing.push({ label: "Add your professional links", href: "/profile/edit" });
  }
  if (!preferences?.preferred_role) {
    missing.push({ label: "Set your career preferences", href: "/profile/edit" });
  }

  return missing;
}
