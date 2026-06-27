import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  UserPlus,
  Users,
} from "lucide-react";
import { getAdminStats } from "@/features/admin/data";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total candidates", value: stats.total, icon: Users },
    { label: "Profiles completed", value: stats.completed, icon: CheckCircle2 },
    { label: "Resume uploaded", value: stats.withResume, icon: FileText },
    { label: "New this week", value: stats.newThisWeek, icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin dashboard
        </h1>
        <Link
          href="/admin/candidates"
          className={buttonVariants({ size: "sm" })}
        >
          View candidates <ArrowRight />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border-border bg-card rounded-xl border p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{label}</span>
              <Icon className="text-muted-foreground size-4" />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
