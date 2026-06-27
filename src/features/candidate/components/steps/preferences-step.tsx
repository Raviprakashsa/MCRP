"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  preferencesSchema,
  type PreferencesFormValues,
  type PreferencesInput,
} from "../../schemas";
import { savePreferences } from "../../actions";
import { useAutosave } from "../../hooks/use-autosave";
import type { Preferences } from "../../types";
import { Field } from "../field";
import { WizardFooter, type SaveState, type WizardNav } from "../wizard-nav";
import { Input } from "@/components/ui/input";

export function PreferencesStep({
  preferences,
  nav,
  onSaved,
}: {
  preferences: Preferences | null;
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
  } = useForm<PreferencesFormValues, unknown, PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_role: preferences?.preferred_role ?? "",
      preferred_location: preferences?.preferred_location ?? "",
      ready_to_relocate: preferences?.ready_to_relocate ?? false,
      expected_ctc: preferences?.expected_ctc ?? undefined,
      immediate_joining: preferences?.immediate_joining ?? false,
      notice_period_days: preferences?.notice_period_days ?? undefined,
    },
  });

  const [save, setSave] = useState<SaveState>("idle");
  const [pending, start] = useTransition();

  const persist = useCallback(
    async (values: PreferencesInput, silent = false) => {
      const res = await savePreferences(values);
      if (res.ok) {
        if (!silent) onSaved();
        return true;
      }
      if (!silent && res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          if (v?.[0])
            setError(k as keyof PreferencesFormValues, { message: v[0] });
        }
      }
      if (!silent && res.error) toast.error(res.error);
      return false;
    },
    [onSaved, setError],
  );

  const values = useWatch({ control });
  const autosave = useCallback(() => {
    const parsed = preferencesSchema.safeParse(getValues());
    if (!parsed.success) return;
    setSave("saving");
    void persist(parsed.data, true).then((ok) =>
      setSave(ok ? "saved" : "idle"),
    );
  }, [getValues, persist]);
  useAutosave(JSON.stringify(values), autosave);

  const onContinue = handleSubmit((data) =>
    start(async () => {
      if (await persist(data)) nav.onNext();
    }),
  );

  return (
    <div>
      <h2 className="text-lg font-semibold">Career preferences</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        What kind of opportunity are you looking for?
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label="Preferred role"
          htmlFor="preferred_role"
          required
          error={errors.preferred_role?.message}
        >
          <Input
            id="preferred_role"
            placeholder="Software Engineer"
            aria-invalid={!!errors.preferred_role}
            {...register("preferred_role")}
          />
        </Field>
        <Field
          label="Preferred location"
          htmlFor="preferred_location"
          error={errors.preferred_location?.message}
        >
          <Input
            id="preferred_location"
            placeholder="Bengaluru"
            {...register("preferred_location")}
          />
        </Field>
        <Field
          label="Expected CTC (₹ / year)"
          htmlFor="expected_ctc"
          error={errors.expected_ctc?.message}
        >
          <Input
            id="expected_ctc"
            type="number"
            min={0}
            placeholder="600000"
            {...register("expected_ctc")}
          />
        </Field>
        <Field
          label="Notice period (days)"
          htmlFor="notice_period_days"
          error={errors.notice_period_days?.message}
        >
          <Input
            id="notice_period_days"
            type="number"
            min={0}
            {...register("notice_period_days")}
          />
        </Field>
        <label className="text-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-primary border-input size-4 rounded"
            {...register("ready_to_relocate")}
          />
          Open to relocating
        </label>
        <label className="text-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-primary border-input size-4 rounded"
            {...register("immediate_joining")}
          />
          Available to join immediately
        </label>
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
