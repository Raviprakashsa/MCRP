import type { Metadata } from "next";
import Link from "next/link";
import { listCandidates } from "@/features/admin/data";
import { CandidateFilters } from "@/features/admin/components/candidate-filters";
import { registrationStatusMeta } from "@/features/candidate/profile-status";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Candidates" };

type SearchParams = Record<string, string | undefined>;

const FILTER_KEYS = [
  "q",
  "status",
  "registration_status",
  "city",
  "state",
  "college",
  "branch",
  "skill",
  "passing_year",
] as const;

function buildQuery(sp: SearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) if (sp[key]) params.set(key, sp[key]!);
  params.set("page", String(page));
  return params.toString();
}

function exportHref(sp: SearchParams, format: "csv" | "xlsx"): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) if (sp[key]) params.set(key, sp[key]!);
  params.set("format", format);
  return `/admin/candidates/export?${params.toString()}`;
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? "1") || 1;
  const { rows, total, pageCount } = await listCandidates({
    q: sp.q,
    status: sp.status,
    registration_status: sp.registration_status,
    city: sp.city,
    state: sp.state,
    college: sp.college,
    branch: sp.branch,
    skill: sp.skill,
    passing_year: sp.passing_year,
    page,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Candidates</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground mr-1 text-sm">
            {total} total
          </span>
          <a
            href={exportHref(sp, "csv")}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Export CSV
          </a>
          <a
            href={exportHref(sp, "xlsx")}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Export Excel
          </a>
        </div>
      </div>

      <CandidateFilters />

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3 [&_th]:py-2">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>College</th>
                <th>Branch</th>
                <th>Year</th>
                <th>City</th>
                <th>Completion</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const edu =
                  r.education.find((e) => e.is_primary) ?? r.education[0];
                const reg = registrationStatusMeta[r.registration_status];
                return (
                  <tr
                    key={r.id}
                    className="border-border hover:bg-muted/30 border-t"
                  >
                    <td>
                      <Link
                        href={`/admin/candidates/${r.id}`}
                        className="text-primary font-mono text-xs hover:underline"
                      >
                        {r.candidate_code}
                      </Link>
                    </td>
                    <td>
                      <div className="font-medium">{r.full_name || "—"}</div>
                      <div className="text-muted-foreground text-xs">
                        {r.email}
                      </div>
                    </td>
                    <td className="max-w-40 truncate">
                      {edu?.college_name ?? "—"}
                    </td>
                    <td>{edu?.branch ?? "—"}</td>
                    <td>{edu?.passing_year ?? "—"}</td>
                    <td>{r.city ?? "—"}</td>
                    <td className="tabular-nums">{r.profile_completion}%</td>
                    <td>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          r.status === "disabled"
                            ? "bg-muted text-muted-foreground"
                            : reg.tone === "success"
                              ? "bg-success/15 text-success"
                              : "bg-accent text-accent-foreground",
                        )}
                      >
                        {r.status === "disabled" ? "Disabled" : reg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-muted-foreground p-10 text-center"
                  >
                    No candidates match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/admin/candidates?${buildQuery(sp, page - 1)}`}
              aria-disabled={page <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-50",
              )}
            >
              Previous
            </Link>
            <Link
              href={`/admin/candidates?${buildQuery(sp, page + 1)}`}
              aria-disabled={page >= pageCount}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page >= pageCount && "pointer-events-none opacity-50",
              )}
            >
              Next
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
