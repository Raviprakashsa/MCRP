"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  experienceSchema,
  projectSchema,
  type ExperienceInput,
  type ProjectInput,
} from "../../schemas";
import {
  addExperience,
  addProject,
  removeExperience,
  removeProject,
} from "../../actions";
import type { Experience, ExperienceType, Project } from "../../types";
import { Field, selectClass } from "../field";
import { WizardFooter, type WizardNav } from "../wizard-nav";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const EXPERIENCE_TYPES: Record<ExperienceType, string> = {
  internship: "Internship",
  work: "Work",
  freelance: "Freelance",
  startup: "Startup",
};

export function ExperienceStep({
  initialProjects,
  initialExperiences,
  nav,
  onSaved,
}: {
  initialProjects: Project[];
  initialExperiences: Experience[];
  nav: WizardNav;
  onSaved: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [experiences, setExperiences] =
    useState<Experience[]>(initialExperiences);
  const [pending, start] = useTransition();

  const projectForm = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      tech_stack: "",
      project_url: "",
      repo_url: "",
    },
  });

  const experienceForm = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      type: "internship",
      organization: "",
      title: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    },
  });

  const submitProject = projectForm.handleSubmit((data) =>
    start(async () => {
      const res = await addProject(data);
      if (!res.ok) {
        toast.error(res.error ?? "Could not add project");
        return;
      }
      if (res.data) {
        const added = res.data;
        setProjects((p) => [...p, added]);
        projectForm.reset();
        onSaved();
      }
    }),
  );

  const submitExperience = experienceForm.handleSubmit((data) =>
    start(async () => {
      const res = await addExperience(data);
      if (!res.ok) {
        toast.error(res.error ?? "Could not add experience");
        return;
      }
      if (res.data) {
        const added = res.data;
        setExperiences((e) => [added, ...e]);
        experienceForm.reset();
        onSaved();
      }
    }),
  );

  const delProject = (id: string) =>
    start(async () => {
      const res = await removeProject(id);
      if (res.ok) {
        setProjects((p) => p.filter((x) => x.id !== id));
        onSaved();
      }
    });

  const delExperience = (id: string) =>
    start(async () => {
      const res = await removeExperience(id);
      if (res.ok) {
        setExperiences((e) => e.filter((x) => x.id !== id));
        onSaved();
      }
    });

  return (
    <div>
      <h2 className="text-lg font-semibold">Experience &amp; projects</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Add internships, work, and projects. Each is saved instantly.
      </p>

      {/* Projects */}
      <section className="mt-5">
        <h3 className="text-sm font-semibold">Projects</h3>
        <div className="mt-3 space-y-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="border-border flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{p.title}</p>
                {p.tech_stack.length ? (
                  <p className="text-muted-foreground truncate text-xs">
                    {p.tech_stack.join(", ")}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => delProject(p.id)}
                aria-label="Remove project"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field
            label="Title"
            htmlFor="p_title"
            error={projectForm.formState.errors.title?.message}
            className="sm:col-span-2"
          >
            <Input id="p_title" {...projectForm.register("title")} />
          </Field>
          <Field
            label="Tech stack (comma separated)"
            htmlFor="p_tech"
            error={projectForm.formState.errors.tech_stack?.message}
            className="sm:col-span-2"
          >
            <Input
              id="p_tech"
              placeholder="React, Node.js"
              {...projectForm.register("tech_stack")}
            />
          </Field>
          <Field
            label="Live URL"
            htmlFor="p_url"
            error={projectForm.formState.errors.project_url?.message}
          >
            <Input id="p_url" {...projectForm.register("project_url")} />
          </Field>
          <Field
            label="Repo URL"
            htmlFor="p_repo"
            error={projectForm.formState.errors.repo_url?.message}
          >
            <Input id="p_repo" {...projectForm.register("repo_url")} />
          </Field>
          <Field
            label="Description"
            htmlFor="p_desc"
            error={projectForm.formState.errors.description?.message}
            className="sm:col-span-2"
          >
            <Textarea
              id="p_desc"
              rows={2}
              {...projectForm.register("description")}
            />
          </Field>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={submitProject}
          disabled={pending}
        >
          <Plus /> Add project
        </Button>
      </section>

      {/* Experience */}
      <section className="border-border mt-8 border-t pt-6">
        <h3 className="text-sm font-semibold">Internships &amp; work</h3>
        <div className="mt-3 space-y-2">
          {experiences.map((x) => (
            <div
              key={x.id}
              className="border-border flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {x.title ? `${x.title} · ` : ""}
                  {x.organization}
                </p>
                <p className="text-muted-foreground text-xs">
                  {EXPERIENCE_TYPES[x.type]}
                  {x.is_current ? " · Current" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => delExperience(x.id)}
                aria-label="Remove experience"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Type" htmlFor="x_type">
            <select
              id="x_type"
              className={selectClass}
              {...experienceForm.register("type")}
            >
              {Object.entries(EXPERIENCE_TYPES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Organization"
            htmlFor="x_org"
            error={experienceForm.formState.errors.organization?.message}
          >
            <Input id="x_org" {...experienceForm.register("organization")} />
          </Field>
          <Field label="Role / title" htmlFor="x_title">
            <Input id="x_title" {...experienceForm.register("title")} />
          </Field>
          <Field label="Location" htmlFor="x_loc">
            <Input id="x_loc" {...experienceForm.register("location")} />
          </Field>
          <Field label="Start date" htmlFor="x_start">
            <Input
              id="x_start"
              type="date"
              {...experienceForm.register("start_date")}
            />
          </Field>
          <Field label="End date" htmlFor="x_end">
            <Input
              id="x_end"
              type="date"
              {...experienceForm.register("end_date")}
            />
          </Field>
          <label className="text-foreground flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              className="accent-primary border-input size-4 rounded"
              {...experienceForm.register("is_current")}
            />
            I currently work here
          </label>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={submitExperience}
          disabled={pending}
        >
          <Plus /> Add experience
        </Button>
      </section>

      <WizardFooter nav={nav} onContinue={nav.onNext} pending={pending} />
    </div>
  );
}
