"use client";

import type { CandidateDocument } from "../../types";
import { ResumeUpload } from "../resume-upload";
import { WizardFooter, type WizardNav } from "../wizard-nav";

export function ResumeStep({
  resume,
  nav,
}: {
  resume: CandidateDocument | null;
  nav: WizardNav;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Resume</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Upload your resume as a PDF (max 5 MB). You can replace it anytime.
      </p>
      <div className="mt-5">
        <ResumeUpload resume={resume} />
      </div>
      <WizardFooter nav={nav} onContinue={nav.onNext} />
    </div>
  );
}
