"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { ProfileBundle, SkillOption } from "../types";
import { PersonalStep } from "./steps/personal-step";
import { EducationStep } from "./steps/education-step";
import { SkillsStep } from "./steps/skills-step";
import { ExperienceStep } from "./steps/experience-step";
import { LinksStep } from "./steps/links-step";
import { PreferencesStep } from "./steps/preferences-step";
import { ResumeStep } from "./steps/resume-step";

const STEP_LABELS = [
  "Personal",
  "Education",
  "Skills",
  "Experience",
  "Links",
  "Preferences",
  "Resume",
] as const;

export function ProfileWizard({
  bundle,
  skillOptions,
  finishHref = "/dashboard",
}: {
  bundle: ProfileBundle;
  skillOptions: SkillOption[];
  finishHref?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const last = STEP_LABELS.length - 1;

  const onSaved = () => router.refresh();
  const onBack = () => setStep((s) => Math.max(0, s - 1));
  const onNext = () => {
    if (step < last) setStep((s) => s + 1);
    else router.push(finishHref);
  };
  const nav = { onBack, onNext, isFirst: step === 0, isLast: step === last };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step + 1} of {STEP_LABELS.length} · {STEP_LABELS[step]}
          </span>
          <span className="text-muted-foreground">
            {bundle.candidate.profile_completion}% complete
          </span>
        </div>
        <Progress value={(step / last) * 100} />
      </div>

      <ol className="mb-6 hidden flex-wrap gap-2 md:flex">
        {STEP_LABELS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {i < step ? <Check className="size-3" /> : null}
              {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
        {step === 0 && (
          <PersonalStep candidate={bundle.candidate} nav={nav} onSaved={onSaved} />
        )}
        {step === 1 && (
          <EducationStep
            education={bundle.education[0] ?? null}
            nav={nav}
            onSaved={onSaved}
          />
        )}
        {step === 2 && (
          <SkillsStep
            initial={bundle.skills}
            options={skillOptions}
            nav={nav}
            onSaved={onSaved}
          />
        )}
        {step === 3 && (
          <ExperienceStep
            initialProjects={bundle.projects}
            initialExperiences={bundle.experiences}
            nav={nav}
            onSaved={onSaved}
          />
        )}
        {step === 4 && (
          <LinksStep initial={bundle.links} nav={nav} onSaved={onSaved} />
        )}
        {step === 5 && (
          <PreferencesStep
            preferences={bundle.preferences}
            nav={nav}
            onSaved={onSaved}
          />
        )}
        {step === 6 && <ResumeStep resume={bundle.resume} nav={nav} />}
      </div>
    </div>
  );
}
