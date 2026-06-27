"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { addSkill, removeSkill } from "../../actions";
import type {
  CandidateSkill,
  Proficiency,
  SkillCategory,
  SkillOption,
} from "../../types";
import { Field, selectClass } from "../field";
import { WizardFooter, type WizardNav } from "../wizard-nav";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  programming_language: "Languages",
  framework: "Frameworks",
  database: "Databases",
  tool: "Tools",
  cloud_platform: "Cloud platforms",
  soft_skill: "Soft skills",
  other: "Other",
};

const PROFICIENCY_LABELS: Record<Proficiency, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export function SkillsStep({
  initial,
  options,
  nav,
  onSaved,
}: {
  initial: CandidateSkill[];
  options: SkillOption[];
  nav: WizardNav;
  onSaved: () => void;
}) {
  const [skills, setSkills] = useState<CandidateSkill[]>(initial);
  const [skillId, setSkillId] = useState("");
  const [proficiency, setProficiency] = useState<Proficiency | "">("");
  const [pending, start] = useTransition();

  const used = useMemo(() => new Set(skills.map((s) => s.skill_id)), [skills]);

  const grouped = useMemo(() => {
    const map = new Map<SkillCategory, SkillOption[]>();
    for (const opt of options) {
      if (used.has(opt.id)) continue;
      const list = map.get(opt.category) ?? [];
      list.push(opt);
      map.set(opt.category, list);
    }
    return map;
  }, [options, used]);

  const add = () => {
    if (!skillId) {
      toast.error("Choose a skill to add");
      return;
    }
    start(async () => {
      const res = await addSkill({
        skill_id: skillId,
        proficiency,
        years_experience: undefined,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not add skill");
        return;
      }
      if (res.data) {
        const added = res.data;
        setSkills((prev) => [
          ...prev.filter((s) => s.skill_id !== added.skill_id),
          added,
        ]);
        setSkillId("");
        setProficiency("");
        onSaved();
      }
    });
  };

  const remove = (id: string) =>
    start(async () => {
      const res = await removeSkill(id);
      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
        onSaved();
      } else {
        toast.error(res.error ?? "Could not remove skill");
      }
    });

  return (
    <div>
      <h2 className="text-lg font-semibold">Skills</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Add at least 3 skills. Each is saved instantly.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Field label="Skill" htmlFor="skill">
          <select
            id="skill"
            className={selectClass}
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
          >
            <option value="">Choose a skill…</option>
            {[...grouped.entries()].map(([category, opts]) => (
              <optgroup key={category} label={CATEGORY_LABELS[category]}>
                {opts.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Proficiency" htmlFor="prof">
          <select
            id="prof"
            className={selectClass}
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value as Proficiency | "")}
          >
            <option value="">—</option>
            {Object.entries(PROFICIENCY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <Button
            type="button"
            variant="secondary"
            onClick={add}
            disabled={pending}
          >
            <Plus /> Add
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <p className="text-muted-foreground text-sm">No skills added yet.</p>
        ) : (
          skills.map((s) => (
            <span
              key={s.id}
              className="bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-full py-1 pr-1 pl-3 text-sm"
            >
              {s.skill?.name ?? "Skill"}
              {s.proficiency ? (
                <span className="text-muted-foreground text-xs">
                  · {PROFICIENCY_LABELS[s.proficiency]}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => remove(s.id)}
                aria-label={`Remove ${s.skill?.name ?? "skill"}`}
                className="hover:bg-background/60 rounded-full p-0.5"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      <WizardFooter nav={nav} onContinue={nav.onNext} pending={pending} />
    </div>
  );
}
