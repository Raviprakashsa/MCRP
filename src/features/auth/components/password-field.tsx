"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Password input with a show/hide toggle, hint, and inline error. */
export function PasswordField({
  label,
  name,
  errors,
  hint,
  ...props
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
} & ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  const hasError = Boolean(errors?.length);
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && !hasError ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-destructive text-xs">
          {errors![0]}
        </p>
      ) : null}
    </div>
  );
}
