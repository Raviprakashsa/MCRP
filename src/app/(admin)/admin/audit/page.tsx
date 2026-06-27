import type { Metadata } from "next";
import Link from "next/link";
import { getAuditLogs } from "@/features/admin/data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit logs" };

const ACTION_LABEL: Record<string, string> = {
  update: "Edited",
  disable: "Disabled",
  enable: "Enabled",
  delete: "Deleted",
  export: "Exported",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const { rows, total, pageCount } = await getAuditLogs(page);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Audit logs</h1>
        <span className="text-muted-foreground text-sm">{total} entries</span>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3 [&_th]:py-2">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Candidate</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-border border-t">
                  <td className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="font-medium">
                    {ACTION_LABEL[r.action] ?? r.action}
                  </td>
                  <td>
                    {r.entity_id ? (
                      <Link
                        href={`/admin/candidates/${r.entity_id}`}
                        className="text-primary font-mono text-xs hover:underline"
                      >
                        {r.entity_id.slice(0, 8)}…
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-muted-foreground text-xs">
                    {r.changes ? JSON.stringify(r.changes) : "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-muted-foreground p-10 text-center"
                  >
                    No activity logged yet.
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
              href={`/admin/audit?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-50",
              )}
            >
              Previous
            </Link>
            <Link
              href={`/admin/audit?page=${page + 1}`}
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
