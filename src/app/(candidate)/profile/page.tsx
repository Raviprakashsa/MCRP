import type { Metadata } from "next";
import Link from "next/link";
import { FilePen } from "lucide-react";
import { getProfileBundle } from "@/features/candidate/data";
import type {
  ExperienceType,
  Gender,
  LinkPlatform,
} from "@/features/candidate/types";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "My profile" };

const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

const PLATFORM_LABELS: Record<LinkPlatform, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  hackerrank: "HackerRank",
  leetcode: "LeetCode",
  codechef: "CodeChef",
  kaggle: "Kaggle",
  other: "Other",
};

const EXPERIENCE_TYPES: Record<ExperienceType, string> = {
  internship: "Internship",
  work: "Work",
  freelance: "Freelance",
  startup: "Startup",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm">{value || "—"}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const {
    candidate,
    education,
    skills,
    projects,
    experiences,
    links,
    preferences,
    resume,
  } = await getProfileBundle();
  const primary = education[0] ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {candidate.full_name || "My profile"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="font-mono">{candidate.candidate_code}</span> ·{" "}
            {candidate.email}
          </p>
        </div>
        <Link
          href="/profile/edit"
          className={buttonVariants({ size: "sm" })}
        >
          <FilePen /> Edit profile
        </Link>
      </div>

      <Section title="Personal">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Detail label="Mobile" value={candidate.mobile} />
          <Detail label="WhatsApp" value={candidate.whatsapp} />
          <Detail
            label="Date of birth"
            value={candidate.date_of_birth}
          />
          <Detail
            label="Gender"
            value={candidate.gender ? GENDER_LABELS[candidate.gender] : null}
          />
          <Detail label="City" value={candidate.city} />
          <Detail label="State" value={candidate.state} />
          <Detail label="PIN code" value={candidate.pin_code} />
          <Detail label="Address" value={candidate.address} />
        </dl>
      </Section>

      <Section title="Education">
        {primary ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Detail label="College" value={primary.college_name} />
            <Detail label="University" value={primary.university} />
            <Detail label="Degree" value={primary.degree} />
            <Detail label="Branch" value={primary.branch} />
            <Detail label="Specialization" value={primary.specialization} />
            <Detail
              label="Passing year"
              value={primary.passing_year?.toString()}
            />
            <Detail
              label="Score"
              value={
                primary.score_value != null
                  ? `${primary.score_value} ${primary.score_type ?? ""}`.trim()
                  : null
              }
            />
            <Detail label="Backlogs" value={primary.backlogs.toString()} />
          </dl>
        ) : (
          <p className="text-muted-foreground text-sm">Not added yet.</p>
        )}
      </Section>

      <Section title="Skills">
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s.id}
                className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-sm"
              >
                {s.skill?.name ?? "Skill"}
                {s.proficiency ? (
                  <span className="text-muted-foreground text-xs">
                    {" "}
                    · {s.proficiency}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Not added yet.</p>
        )}
      </Section>

      <Section title="Experience & projects">
        {experiences.length === 0 && projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not added yet.</p>
        ) : (
          <div className="space-y-4">
            {experiences.map((x) => (
              <div key={x.id}>
                <p className="text-sm font-medium">
                  {x.title ? `${x.title} · ` : ""}
                  {x.organization}
                </p>
                <p className="text-muted-foreground text-xs">
                  {EXPERIENCE_TYPES[x.type]}
                  {x.location ? ` · ${x.location}` : ""}
                  {x.is_current ? " · Current" : ""}
                </p>
              </div>
            ))}
            {projects.map((p) => (
              <div key={p.id}>
                <p className="text-sm font-medium">{p.title}</p>
                {p.tech_stack.length ? (
                  <p className="text-muted-foreground text-xs">
                    {p.tech_stack.join(", ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Professional links">
        {links.length ? (
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.id} className="text-sm">
                <span className="font-medium">
                  {l.label || PLATFORM_LABELS[l.platform]}:
                </span>{" "}
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary break-all hover:underline"
                >
                  {l.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Not added yet.</p>
        )}
      </Section>

      <Section title="Career preferences">
        {preferences?.preferred_role ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Detail label="Preferred role" value={preferences.preferred_role} />
            <Detail
              label="Preferred location"
              value={preferences.preferred_location}
            />
            <Detail
              label="Expected CTC"
              value={
                preferences.expected_ctc != null
                  ? `₹${preferences.expected_ctc.toLocaleString("en-IN")}`
                  : null
              }
            />
            <Detail
              label="Open to relocate"
              value={preferences.ready_to_relocate ? "Yes" : "No"}
            />
            <Detail
              label="Immediate joining"
              value={preferences.immediate_joining ? "Yes" : "No"}
            />
            <Detail
              label="Notice period"
              value={
                preferences.notice_period_days != null
                  ? `${preferences.notice_period_days} days`
                  : null
              }
            />
          </dl>
        ) : (
          <p className="text-muted-foreground text-sm">Not added yet.</p>
        )}
      </Section>

      <Section title="Resume">
        <p className="text-sm">
          {resume ? (
            <span className="text-success">
              {resume.file_name ?? "resume.pdf"} uploaded.
            </span>
          ) : (
            <span className="text-muted-foreground">No resume uploaded. </span>
          )}{" "}
          <Link href="/resume" className="text-primary hover:underline">
            Manage resume
          </Link>
        </p>
      </Section>
    </div>
  );
}
