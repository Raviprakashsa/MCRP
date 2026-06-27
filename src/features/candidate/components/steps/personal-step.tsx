"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { personalSchema, type PersonalInput } from "../../schemas";
import { savePersonal } from "../../actions";
import { useAutosave } from "../../hooks/use-autosave";
import type { Candidate } from "../../types";
import { Field, selectClass } from "../field";
import { WizardFooter, type SaveState, type WizardNav } from "../wizard-nav";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PersonalStep({
  candidate,
  nav,
  onSaved,
}: {
  candidate: Candidate;
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
  } = useForm<PersonalInput>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      full_name: candidate.full_name ?? "",
      mobile: candidate.mobile ?? "",
      whatsapp: candidate.whatsapp ?? "",
      date_of_birth: candidate.date_of_birth ?? "",
      gender: candidate.gender ?? "",
      address: candidate.address ?? "",
      city: candidate.city ?? "",
      state: candidate.state ?? "",
      pin_code: candidate.pin_code ?? "",
    },
  });

  const [save, setSave] = useState<SaveState>("idle");
  const [pending, start] = useTransition();

  const persist = useCallback(
    async (values: PersonalInput, silent = false) => {
      const res = await savePersonal(values);
      if (res.ok) {
        if (!silent) onSaved();
        return true;
      }
      if (!silent && res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          if (v?.[0]) setError(k as keyof PersonalInput, { message: v[0] });
        }
      }
      if (!silent && res.error) toast.error(res.error);
      return false;
    },
    [onSaved, setError],
  );

  const values = useWatch({ control });
  const autosave = useCallback(() => {
    const parsed = personalSchema.safeParse(getValues());
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
      <h2 className="text-lg font-semibold">Personal details</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Tell us who you are. Fields marked * are required.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          htmlFor="full_name"
          required
          error={errors.full_name?.message}
          className="sm:col-span-2"
        >
          <Input
            id="full_name"
            autoComplete="name"
            aria-invalid={!!errors.full_name}
            {...register("full_name")}
          />
        </Field>
        <Field
          label="Mobile"
          htmlFor="mobile"
          required
          error={errors.mobile?.message}
        >
          <Input
            id="mobile"
            inputMode="numeric"
            autoComplete="tel"
            aria-invalid={!!errors.mobile}
            {...register("mobile")}
          />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp?.message}>
          <Input id="whatsapp" inputMode="numeric" {...register("whatsapp")} />
        </Field>
        <Field
          label="Date of birth"
          htmlFor="dob"
          error={errors.date_of_birth?.message}
        >
          <Input id="dob" type="date" {...register("date_of_birth")} />
        </Field>
        <Field label="Gender" htmlFor="gender" error={errors.gender?.message}>
          <select id="gender" className={selectClass} {...register("gender")}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </Field>
        <Field label="City" htmlFor="city" required error={errors.city?.message}>
          <Input id="city" aria-invalid={!!errors.city} {...register("city")} />
        </Field>
        <Field
          label="State"
          htmlFor="state"
          required
          error={errors.state?.message}
        >
          <Input id="state" aria-invalid={!!errors.state} {...register("state")} />
        </Field>
        <Field label="PIN code" htmlFor="pin" error={errors.pin_code?.message}>
          <Input id="pin" inputMode="numeric" {...register("pin_code")} />
        </Field>
        <Field
          label="Address"
          htmlFor="address"
          error={errors.address?.message}
          className="sm:col-span-2"
        >
          <Textarea id="address" rows={2} {...register("address")} />
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
