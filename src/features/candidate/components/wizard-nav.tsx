"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type WizardNav = {
  onBack: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export type SaveState = "idle" | "saving" | "saved";

export function SavingIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span className="text-muted-foreground flex items-center gap-1 text-xs">
      {state === "saving" ? (
        <>
          <Loader2 className="size-3 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Check className="text-success size-3" /> Saved
        </>
      )}
    </span>
  );
}

export function WizardFooter({
  nav,
  onContinue,
  pending,
  saving = "idle",
}: {
  nav: WizardNav;
  onContinue: () => void;
  pending?: boolean;
  saving?: SaveState;
}) {
  return (
    <div className="border-border mt-6 flex items-center justify-between gap-3 border-t pt-5">
      <Button
        type="button"
        variant="ghost"
        onClick={nav.onBack}
        disabled={nav.isFirst || pending}
      >
        Back
      </Button>
      <div className="flex items-center gap-3">
        <SavingIndicator state={saving} />
        <Button type="button" onClick={onContinue} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {nav.isLast ? "Finish" : "Save & continue"}
        </Button>
      </div>
    </div>
  );
}
