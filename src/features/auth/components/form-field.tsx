import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Labelled text input with hint + inline error, wired for accessibility. */
export function FormField({
  label,
  name,
  errors,
  hint,
  className,
  ...props
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
} & ComponentProps<typeof Input>) {
  const hasError = Boolean(errors?.length);
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : hint ? hintId : undefined}
        {...props}
      />
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
