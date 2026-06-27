"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  personalSchema,
  type PersonalInput,
} from "@/features/candidate/schemas";
import { updateCandidatePersonal } from "@/features/admin/actions";
import { Field, selectClass } from "@/features/candidate/components/field";
import type { Candidate } from "@/features/candidate/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AdminEditForm({ candidate }: { candidate: Candidate }) {
  const {
    register,
    handleSubmit,
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
  const [pending, start] = useTransition();

  const onSubmit = handleSubmit((data) =>
    start(async () => {
      const res = await updateCandidatePersonal(candidate.id, data);
      if (res && !res.ok) {
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            if (v?.[0]) setError(k as keyof PersonalInput, { message: v[0] });
          }
        }
        if (res.error) toast.error(res.error);
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Full name"
        htmlFor="full_name"
        required
        error={errors.full_name?.message}
        className="sm:col-span-2"
      >
        <Input id="full_name" {...register("full_name")} />
      </Field>
      <Field
        label="Mobile"
        htmlFor="mobile"
        required
        error={errors.mobile?.message}
      >
        <Input id="mobile" inputMode="numeric" {...register("mobile")} />
      </Field>
      <Field
        label="WhatsApp"
        htmlFor="whatsapp"
        error={errors.whatsapp?.message}
      >
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
        <Input id="city" {...register("city")} />
      </Field>
      <Field
        label="State"
        htmlFor="state"
        required
        error={errors.state?.message}
      >
        <Input id="state" {...register("state")} />
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
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
