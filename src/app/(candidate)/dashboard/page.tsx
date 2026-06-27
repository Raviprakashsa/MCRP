import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FilePen,
  FileText,
  Settings,
  UserRound,
} from "lucide-react";
import { getProfileBundle } from "@/features/candidate/data";
import {
  computeMissingSections,
  registrationStatusMeta,
} from "@/features/candidate/profile-status";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const toneClass = {
  muted: "bg-muted text-muted-foreground",
  info: "bg-accent text-accent-foreground",
  success: "bg-success/15 text-success",
} as const;

const quickLinks = [
  { href: "/profile", icon: UserRound, label: "My profile", desc: "View your details" },
  { href: "/profile/edit", icon: FilePen, label: "Edit profile", desc: "Update any section" },
  { href: "/resume", icon: FileText, label: "Resume", desc: "Upload or replace" },
  { href: "/settings", icon: Settings, label: "Settings", desc: "Password & account" },
];

export default async function DashboardPage() {
  const bundle = await getProfileBundle();
  const { candidate } = bundle;
  const firstName = candidate.full_name.trim().split(" ")[0] || "there";
  const missing = computeMissingSections(bundle);
  const status = registrationStatusMeta[candidate.registration_status];
  const complete = candidate.profile_completion >= 100;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Candidate ID{" "}
            <span className="text-foreground font-mono">
              {candidate.candidate_code}
            </span>
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
            toneClass[status.tone],
          )}
        >
          {status.label}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile completion</CardTitle>
          <CardDescription>
            {complete
              ? "Your profile is complete — nicely done!"
              : "A complete profile improves your chances of being matched."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold">
                {candidate.profile_completion}%
              </span>
            </div>
            <Progress value={candidate.profile_completion} />
          </div>

          {complete ? (
            <p className="text-success flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4" /> All sections complete.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">Next steps</p>
              <ul className="space-y-2">
                {missing.slice(0, 4).map((m) => (
                  <li key={m.label}>
                    <Link
                      href={m.href}
                      className="group border-border hover:border-primary/40 flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors"
                    >
                      <span>{m.label}</span>
                      <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/profile/edit"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                Continue your profile <ArrowRight />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="group border-border bg-card hover:border-primary/40 flex flex-col rounded-xl border p-5 transition-colors hover:shadow-sm"
          >
            <span className="bg-primary/10 text-primary inline-flex size-10 items-center justify-center rounded-lg">
              <Icon className="size-5" />
            </span>
            <span className="mt-3 font-medium">{label}</span>
            <span className="text-muted-foreground text-sm">{desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
