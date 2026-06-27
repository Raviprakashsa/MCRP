import type { Metadata } from "next";
import { getProfileBundle } from "@/features/candidate/data";
import { ResumeUpload } from "@/features/candidate/components/resume-upload";

export const metadata: Metadata = { title: "Resume" };

export default async function ResumePage() {
  const { resume } = await getProfileBundle();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Upload or replace your resume. PDF only, up to 5 MB.
      </p>
      <div className="mt-6">
        <ResumeUpload resume={resume} />
      </div>
    </div>
  );
}
