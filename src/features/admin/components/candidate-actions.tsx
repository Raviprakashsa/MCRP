"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Ban, CircleCheck, FilePen, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  setCandidateStatus,
  softDeleteCandidate,
} from "@/features/admin/actions";
import { Button, buttonVariants } from "@/components/ui/button";

export function CandidateActions({
  id,
  status,
}: {
  id: string;
  status: "active" | "disabled";
}) {
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      const res = await setCandidateStatus(
        id,
        status === "active" ? "disabled" : "active",
      );
      if (!res.ok) toast.error(res.error ?? "Action failed");
      else
        toast.success(
          status === "active" ? "Candidate disabled" : "Candidate enabled",
        );
    });

  const remove = () => {
    if (
      !window.confirm(
        "Delete this candidate? They'll be hidden from the list (soft delete, recoverable).",
      )
    )
      return;
    start(async () => {
      const res = await softDeleteCandidate(id);
      if (res && !res.ok) toast.error(res.error ?? "Delete failed");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/candidates/${id}/edit`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <FilePen /> Edit
      </Link>
      <Button variant="outline" size="sm" onClick={toggle} disabled={pending}>
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : status === "active" ? (
          <Ban />
        ) : (
          <CircleCheck />
        )}
        {status === "active" ? "Disable" : "Enable"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={remove}
        disabled={pending}
      >
        <Trash2 /> Delete
      </Button>
    </div>
  );
}
