"use client";

import { useActionState } from "react";
import {
  resendOtpAction,
  verifyEmailAction,
  type AuthFormState,
} from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import { FormAlert } from "./form-alert";

const initialState: AuthFormState = {};

export function VerifyEmailForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(verifyEmailAction, initialState);
  const [resend, resendAction] = useActionState(resendOtpAction, initialState);

  return (
    <div className="grid gap-4">
      {state.error ? <FormAlert>{state.error}</FormAlert> : null}
      {resend.error ? <FormAlert>{resend.error}</FormAlert> : null}
      {resend.success ? (
        <FormAlert variant="success">{resend.message}</FormAlert>
      ) : null}

      <form action={formAction} className="grid gap-4" noValidate>
        <input type="hidden" name="email" value={email} />
        <div className="grid gap-1.5">
          <Label htmlFor="token">6-digit code</Label>
          <Input
            id="token"
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            className="text-center text-lg tracking-[0.6em]"
            aria-invalid={Boolean(state.fieldErrors?.token)}
            required
          />
          {state.fieldErrors?.token ? (
            <p className="text-destructive text-xs">
              {state.fieldErrors.token[0]}
            </p>
          ) : null}
        </div>
        <SubmitButton size="lg" className="w-full">
          Verify &amp; continue
        </SubmitButton>
      </form>

      <form action={resendAction} className="text-center">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          className="text-muted-foreground text-xs hover:underline"
        >
          Didn&apos;t get the code? Resend
        </button>
      </form>
    </div>
  );
}
