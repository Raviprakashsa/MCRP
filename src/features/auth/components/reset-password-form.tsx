"use client";

import { useActionState } from "react";
import {
  resetPasswordAction,
  type AuthFormState,
} from "@/features/auth/actions";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { FormAlert } from "./form-alert";

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number"
        errors={state.fieldErrors?.password}
        required
      />
      <PasswordField
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        errors={state.fieldErrors?.confirmPassword}
        required
      />
      <SubmitButton size="lg" className="w-full">
        Update password
      </SubmitButton>
    </form>
  );
}
