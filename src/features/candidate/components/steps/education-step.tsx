"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  educationSchema,
  type EducationFormValues,
  type EducationInput,
} from "../../schemas";
import { saveEducation } from "../../actions";
import { useAutosave } from "../../hooks/use-autosave";
import type { Education } from "../../types";
import { Field, selectClass } from "../field";
import { WizardFooter, type SaveState, type WizardNav } from "../wizard-nav";
import { Input } from "@/components/ui/input";

export function EducationStep({
  education,
  nav,
  onSaved,
}: {
  education: Education | null;
  nav: WizardNav;
  onSaved: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<EducationFormValues, unknown, EducationInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      college_name: education?.college_name ?? "",
      university: education?.university ?? "",
      degree: education?.degree ?? "",
      branch: education?.branch ?? "",
      specialization: education?.specialization ?? "",
      current_semester: education?.current_semester ?? undefined,
      passing_year: education?.passing_year ?? undefined,
      score_type: education?.score_type ?? "",
      score_value: education?.score_value ?? undefined,
      backlogs: education?.backlogs ?? undefined,
    },
  });

  const [save, setSave] = useState<SaveState>("idle");
  const [pending, start] = useTransition();

  const persist = useCallback(
    async (values: EducationInput, silent = false) => {
      const res = await saveEducation(values);
      if (res.ok) {
        if (!silent) onSaved();
        return true;
      }
      if (!silent && res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          if (v?.[0]) setError(k as keyof EducationFormValues, { message: v[0] });
        }
      }
      if (!silent && res.error) toast.error(res.error);
      return false;
    },
    [onSaved, setError],
  );

  const values = useWatch({ control });
  const autosave = useCallback(() => {
    const parsed = educationSchema.safeParse(getValues());
    if (!parsed.success) return;
    setSave("saving");
    void persist(parsed.data, true).then((ok) => setSave(ok ? "saved" : "idle"));
  }, [getValues, persist]);
  useAutosave(JSON.stringify(values), autosave);

  const onContinue = handleSubmit((data) =>
    start(async () => {
      if (await persist(data)) nav.onNext();
    }),
  );

  return (
    <div>
      <h2 className="text-lg font-semibold">Education</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Your highest / current qualification. You can add more later from your
        profile.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label="College"
          htmlFor="college_name"
          required
          error={errors.college_name?.message}
          className="sm:col-span-2"
        >
          <Input
            id="college_name"
            aria-invalid={!!errors.college_name}
            {...register("college_name")}
          />
        </Field>
        <Field label="University" htmlFor="university" error={errors.university?.message}>
          <Input id="university" {...register("university")} />
        </Field>
        <Field
          label="Degree"
          htmlFor="degree"
          required
          error={errors.degree?.message}
        >
          <Input
            id="degree"
            placeholder="B.E / B.Tech / BCA…"
            aria-invalid={!!errors.degree}
            {...register("degree")}
          />
        </Field>
        <Field label="Branch" htmlFor="branch" error={errors.branch?.message}>
          <Input id="branch" placeholder="CSE / ISE / ECE…" {...register("branch")} />
        </Field>
        <Field
          label="Specialization"
          htmlFor="specialization"
          error={errors.specialization?.message}
        >
          <Input id="specialization" {...register("specialization")} />
        </Field>
        <Field
          label="Current semester"
          htmlFor="current_semester"
          error={errors.current_semester?.message}
        >
          <Input
            id="current_semester"
            type="number"
            min={1}
            max={12}
            {...register("current_semester")}
          />
        </Field>
        <Field
          label="Passing year"
          htmlFor="passing_year"
          required
          error={errors.passing_year?.message}
        >
          <Input
            id="passing_year"
            type="number"
            min={1980}
            aria-invalid={!!errors.passing_year}
            {...register("passing_year")}
          />
        </Field>
        <Field label="Score type" htmlFor="score_type" error={errors.score_type?.message}>
          <select id="score_type" className={selectClass} {...register("score_type")}>
            <option value="">Select…</option>
            <option value="cgpa">CGPA</option>
            <option value="percentage">Percentage</option>
          </select>
        </Field>
        <Field label="Score" htmlFor="score_value" error={errors.score_value?.message}>
          <Input
            id="score_value"
            type="number"
            step="0.01"
            placeholder="8.5 or 85"
            {...register("score_value")}
          />
        </Field>
        <Field label="Backlogs" htmlFor="backlogs" error={errors.backlogs?.message}>
          <Input id="backlogs" type="number" min={0} {...register("backlogs")} />
        </Field>
      </div>
      <WizardFooter
        nav={nav}
        onContinue={onContinue}
        pending={pending}
        saving={save}
      />
    </div>
  );
}
