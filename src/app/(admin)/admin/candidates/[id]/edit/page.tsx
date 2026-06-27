import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCandidateDetail } from "@/features/admin/data";
import { AdminEditForm } from "@/features/admin/components/admin-edit-form";

export const metadata: Metadata = { title: "Edit candidate" };

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = await getCandidateDetail(id);
  if (!bundle) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={`/admin/candidates/${id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to candidate
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit candidate
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          <span className="font-mono">{bundle.candidate.candidate_code}</span> ·{" "}
          {bundle.candidate.email}
        </p>
      </div>

      <div className="border-border bg-card rounded-2xl border p-6">
        <AdminEditForm candidate={bundle.candidate} />
      </div>
    </div>
  );
}
