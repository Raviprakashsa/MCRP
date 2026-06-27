"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/features/auth/actions";
import { FormField } from "./form-field";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { FormAlert } from "./form-alert";

const initialState: AuthFormState = {};

export function LoginForm({ redirectedFrom }: { redirectedFrom?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.error ? <FormAlert>{state.error}</FormAlert> : null}
      {redirectedFrom ? (
        <input type="hidden" name="redirectedFrom" value={redirectedFrom} />
      ) : null}

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        errors={state.fieldErrors?.email}
        required
      />
      <div className="grid gap-1.5">
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          errors={state.fieldErrors?.password}
          required
        />
        <Link
          href="/forgot-password"
          className="text-primary justify-self-end text-xs hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <SubmitButton size="lg" className="w-full">
        Log in
      </SubmitButton>

      <p className="text-muted-foreground text-center text-sm">
        New here?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
