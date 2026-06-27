"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { linkSchema, type LinkInput } from "../../schemas";
import { addLink, removeLink } from "../../actions";
import type { CandidateLink, LinkPlatform } from "../../types";
import { Field, selectClass } from "../field";
import { WizardFooter, type WizardNav } from "../wizard-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PLATFORM_LABELS: Record<LinkPlatform, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  hackerrank: "HackerRank",
  leetcode: "LeetCode",
  codechef: "CodeChef",
  kaggle: "Kaggle",
  other: "Other",
};

export function LinksStep({
  initial,
  nav,
  onSaved,
}: {
  initial: CandidateLink[];
  nav: WizardNav;
  onSaved: () => void;
}) {
  const [links, setLinks] = useState<CandidateLink[]>(initial);
  const [pending, start] = useTransition();

  const form = useForm<LinkInput>({
    resolver: zodResolver(linkSchema),
    defaultValues: { platform: "github", url: "", label: "" },
  });

  const platform = useWatch({ control: form.control, name: "platform" });

  const submit = form.handleSubmit((data) =>
    start(async () => {
      const res = await addLink(data);
      if (!res.ok) {
        toast.error(res.error ?? "Could not add link");
        return;
      }
      if (res.data) {
        const added = res.data;
        setLinks((prev) => [
          ...prev.filter(
            (l) => !(l.platform === added.platform && l.platform !== "other"),
          ),
          added,
        ]);
        form.reset({ platform: "github", url: "", label: "" });
        onSaved();
      }
    }),
  );

  const remove = (id: string) =>
    start(async () => {
      const res = await removeLink(id);
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
        onSaved();
      }
    });

  return (
    <div>
      <h2 className="text-lg font-semibold">Professional profiles</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Link your GitHub, LinkedIn, and coding profiles. Each is saved
        instantly.
      </p>

      <div className="mt-5 space-y-2">
        {links.map((l) => (
          <div
            key={l.id}
            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {l.label || PLATFORM_LABELS[l.platform]}
              </p>
              <p className="text-muted-foreground truncate text-xs">{l.url}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(l.id)}
              aria-label="Remove link"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Platform" htmlFor="platform">
          <select
            id="platform"
            className={selectClass}
            {...form.register("platform")}
          >
            {Object.entries(PLATFORM_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        {platform === "other" ? (
          <Field
            label="Label"
            htmlFor="label"
            error={form.formState.errors.label?.message}
          >
            <Input
              id="label"
              placeholder="e.g. Behance"
              {...form.register("label")}
            />
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field
          label="URL"
          htmlFor="url"
          error={form.formState.errors.url?.message}
          className="sm:col-span-2"
        >
          <Input id="url" placeholder="https://…" {...form.register("url")} />
        </Field>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        onClick={submit}
        disabled={pending}
      >
        <Plus /> Add link
      </Button>

      <WizardFooter nav={nav} onContinue={nav.onNext} pending={pending} />
    </div>
  );
}
