"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  getResumeDownloadUrl,
  removeResume,
  uploadResume,
} from "../actions";
import type { CandidateDocument } from "../types";
import { Button } from "@/components/ui/button";

function formatBytes(n: number | null): string {
  if (!n) return "";
  const kb = n / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

export function ResumeUpload({ resume: initial }: { resume: CandidateDocument | null }) {
  const router = useRouter();
  const [resume, setResume] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  const upload = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    start(async () => {
      const res = await uploadResume(fd);
      if (res.ok) {
        setResume({
          id: "current",
          type: "resume",
          file_path: "",
          file_name: file.name,
          mime_type: "application/pdf",
          size_bytes: file.size,
          uploaded_at: new Date().toISOString(),
        });
        toast.success("Resume uploaded");
        router.refresh();
      } else {
        toast.error(res.error ?? "Upload failed");
      }
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const view = () =>
    start(async () => {
      const url = await getResumeDownloadUrl();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else toast.error("Could not open the resume.");
    });

  const remove = () =>
    start(async () => {
      const res = await removeResume();
      if (res.ok) {
        setResume(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not remove the resume.");
      }
    });

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onFile}
      />

      {resume ? (
        <div className="border-border flex items-center justify-between gap-3 rounded-xl border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-primary/10 text-primary inline-flex size-10 items-center justify-center rounded-lg">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {resume.file_name ?? "resume.pdf"}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatBytes(resume.size_bytes)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={view}
              disabled={pending}
            >
              <ExternalLink /> View
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove resume"
              onClick={remove}
              disabled={pending}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="border-border hover:border-primary/40 mt-4 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        ) : (
          <Upload className="text-muted-foreground size-6" />
        )}
        <span className="text-sm font-medium">
          {resume ? "Replace resume" : "Click to upload your resume"}
        </span>
        <span className="text-muted-foreground text-xs">PDF only · up to 5 MB</span>
      </button>
    </div>
  );
}
