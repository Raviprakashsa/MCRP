"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  forgotPasswordAction,
  type AuthFormState,
} from "@/features/auth/actions";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { FormAlert } from "./form-alert";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.success ? (
        <FormAlert variant="success">{state.message}</FormAlert>
      ) : null}
      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        errors={state.fieldErrors?.email}
        required
      />
      <SubmitButton size="lg" className="w-full">
        Send reset link
      </SubmitButton>
      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
