"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/features/auth/actions";
import { FormField } from "./form-field";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { FormAlert } from "./form-alert";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <FormField
        label="Full name"
        name="full_name"
        autoComplete="name"
        placeholder="Rahul Sharma"
        errors={state.fieldErrors?.full_name}
        required
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        errors={state.fieldErrors?.email}
        required
      />
      <FormField
        label="Mobile"
        name="mobile"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="9876543210"
        hint="10-digit Indian mobile number"
        errors={state.fieldErrors?.mobile}
        required
      />
      <FormField
        label="WhatsApp (optional)"
        name="whatsapp"
        inputMode="numeric"
        placeholder="Same as mobile if blank"
        errors={state.fieldErrors?.whatsapp}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number"
        errors={state.fieldErrors?.password}
        required
      />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        errors={state.fieldErrors?.confirmPassword}
        required
      />

      <div className="grid gap-1">
        <label
          htmlFor="consent"
          className="text-muted-foreground flex items-start gap-2 text-xs"
        >
          <input
            id="consent"
            name="consent"
            type="checkbox"
            className="accent-primary border-input mt-0.5 size-4 rounded"
          />
          <span>
            I agree to Magnus Copo storing and processing my information for
            placement purposes, per the privacy policy.
          </span>
        </label>
        {state.fieldErrors?.consent ? (
          <p className="text-destructive text-xs">
            {state.fieldErrors.consent[0]}
          </p>
        ) : null}
      </div>

      <SubmitButton size="lg" className="w-full">
        Create account
      </SubmitButton>

      <p className="text-muted-foreground text-center text-sm">
        Already registered?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
