"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "../schemas";
import { changePassword } from "../actions";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const [pending, start] = useTransition();

  const onSubmit = handleSubmit((data) =>
    start(async () => {
      const res = await changePassword(data);
      if (res.ok) {
        toast.success("Password updated");
        reset();
        return;
      }
      if (res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          if (v?.[0]) setError(k as keyof ChangePasswordInput, { message: v[0] });
        }
      }
      if (res.error) toast.error(res.error);
    }),
  );

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-4">
      <Field
        label="Current password"
        htmlFor="currentPassword"
        error={errors.currentPassword?.message}
      >
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
      </Field>
      <Field
        label="New password"
        htmlFor="newPassword"
        error={errors.newPassword?.message}
      >
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
      </Field>
      <Field
        label="Confirm new password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </Field>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? <Loader2 className="animate-spin" /> : null}
        Update password
      </Button>
    </form>
  );
}
