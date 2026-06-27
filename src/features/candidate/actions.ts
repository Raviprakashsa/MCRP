"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  educationSchema,
  experienceSchema,
  linkSchema,
  personalSchema,
  preferencesSchema,
  projectSchema,
  skillSchema,
  changePasswordSchema,
  type EducationInput,
  type ExperienceInput,
  type LinkInput,
  type PersonalInput,
  type PreferencesInput,
  type ProjectInput,
  type SkillInput,
  type ChangePasswordInput,
} from "./schemas";
import type {
  CandidateLink,
  CandidateSkill,
  Experience,
  Project,
} from "./types";

export type FieldErrors = Record<string, string[] | undefined>;
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error?: string; fieldErrors?: FieldErrors };

/** Empty string → null (for nullable DB columns). */
function nz(v: string | undefined | null): string | null {
  return v && v.trim() !== "" ? v.trim() : null;
}

/** number | undefined → number | null. */
function nn(v: number | undefined): number | null {
  return v === undefined ? null : v;
}

async function getAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, uid: user.id, email: user.email };
}

function revalidateCandidate() {
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/onboarding");
  revalidatePath("/resume");
}

function mapDbError(error: { code?: string; message?: string }): ActionResult {
  if (error.code === "23505") {
    if (error.message?.includes("mobile")) {
      return {
        ok: false,
        fieldErrors: { mobile: ["This mobile number is already in use."] },
      };
    }
    return { ok: false, error: "That value is already in use." };
  }
  return { ok: false, error: error.message ?? "Something went wrong." };
}

// --------------------------------------------------------------- Personal
export async function savePersonal(
  input: PersonalInput,
): Promise<ActionResult> {
  const parsed = personalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;
  const { supabase, uid } = await getAuth();

  const { error } = await supabase
    .from("candidates")
    .update({
      full_name: d.full_name.trim(),
      mobile: d.mobile.trim(),
      whatsapp: nz(d.whatsapp),
      date_of_birth: nz(d.date_of_birth),
      gender: d.gender ? d.gender : null,
      address: nz(d.address),
      city: d.city.trim(),
      state: d.state.trim(),
      pin_code: nz(d.pin_code),
    })
    .eq("id", uid);

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// --------------------------------------------------------------- Education
export async function saveEducation(
  input: EducationInput,
): Promise<ActionResult> {
  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;
  const { supabase, uid } = await getAuth();

  const row = {
    candidate_id: uid,
    college_name: d.college_name.trim(),
    university: nz(d.university),
    degree: d.degree.trim(),
    branch: nz(d.branch),
    specialization: nz(d.specialization),
    current_semester: nn(d.current_semester),
    passing_year: d.passing_year,
    score_type: d.score_type ? d.score_type : null,
    score_value: nn(d.score_value),
    backlogs: d.backlogs ?? 0,
    is_primary: true,
  };

  const { data: existing } = await supabase
    .from("candidate_education")
    .select("id")
    .eq("candidate_id", uid)
    .eq("is_primary", true)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("candidate_education")
        .update(row)
        .eq("id", existing.id)
    : await supabase.from("candidate_education").insert(row);

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// ------------------------------------------------------------- Preferences
export async function savePreferences(
  input: PreferencesInput,
): Promise<ActionResult> {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;
  const { supabase, uid } = await getAuth();

  const { error } = await supabase.from("candidate_preferences").upsert(
    {
      candidate_id: uid,
      preferred_role: d.preferred_role.trim(),
      preferred_location: nz(d.preferred_location),
      ready_to_relocate: d.ready_to_relocate ?? false,
      expected_ctc: nn(d.expected_ctc),
      immediate_joining: d.immediate_joining ?? false,
      notice_period_days: nn(d.notice_period_days),
    },
    { onConflict: "candidate_id" },
  );

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// ------------------------------------------------------------------ Skills
export async function addSkill(
  input: SkillInput,
): Promise<ActionResult<CandidateSkill>> {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;
  const { supabase, uid } = await getAuth();

  const { data, error } = await supabase
    .from("candidate_skills")
    .upsert(
      {
        candidate_id: uid,
        skill_id: d.skill_id,
        proficiency: d.proficiency ? d.proficiency : null,
        years_experience: nn(d.years_experience),
      },
      { onConflict: "candidate_id,skill_id" },
    )
    .select(
      "id, skill_id, proficiency, years_experience, skill:skills(name, category)",
    )
    .single<CandidateSkill>();

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true, data };
}

export async function removeSkill(id: string): Promise<ActionResult> {
  const { supabase, uid } = await getAuth();
  const { error } = await supabase
    .from("candidate_skills")
    .delete()
    .eq("id", id)
    .eq("candidate_id", uid);
  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// ---------------------------------------------------------------- Projects
export async function addProject(
  input: ProjectInput,
): Promise<ActionResult<Project>> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;
  const { supabase, uid } = await getAuth();

  const tech = (d.tech_stack ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("candidate_projects")
    .insert({
      candidate_id: uid,
      title: d.title.trim(),
      description: nz(d.description),
      tech_stack: tech,
      project_url: nz(d.project_url),
      repo_url: nz(d.repo_url),
    })
    .select("id, title, description, tech_stack, project_url, repo_url")
    .single<Project>();

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true, data };
}

export async function removeProject(id: string): Promise<ActionResult> {
  const { supabase, uid } = await getAuth();
  const { error } = await supabase
    .from("candidate_projects")
    .delete()
    .eq("id", id)
    .eq("candidate_id", uid);
  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// ------------------------------------------------------------- Experiences
export async function addExperience(
  input: ExperienceInput,
): Promise<ActionResult<Experience>> {
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;
  const { supabase, uid } = await getAuth();

  const { data, error } = await supabase
    .from("candidate_experiences")
    .insert({
      candidate_id: uid,
      type: d.type,
      organization: d.organization.trim(),
      title: nz(d.title),
      description: nz(d.description),
      location: nz(d.location),
      start_date: nz(d.start_date),
      end_date: d.is_current ? null : nz(d.end_date),
      is_current: d.is_current ?? false,
    })
    .select(
      "id, type, organization, title, description, location, start_date, end_date, is_current",
    )
    .single<Experience>();

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true, data };
}

export async function removeExperience(id: string): Promise<ActionResult> {
  const { supabase, uid } = await getAuth();
  const { error } = await supabase
    .from("candidate_experiences")
    .delete()
    .eq("id", id)
    .eq("candidate_id", uid);
  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// ------------------------------------------------------------------- Links
export async function addLink(
  input: LinkInput,
): Promise<ActionResult<CandidateLink>> {
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;
  const { supabase, uid } = await getAuth();

  const { data, error } = await supabase
    .from("candidate_links")
    .upsert(
      {
        candidate_id: uid,
        platform: d.platform,
        url: d.url.trim(),
        label: nz(d.label),
      },
      d.platform === "other"
        ? undefined
        : { onConflict: "candidate_id,platform" },
    )
    .select("id, platform, url, label")
    .single<CandidateLink>();

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true, data };
}

export async function removeLink(id: string): Promise<ActionResult> {
  const { supabase, uid } = await getAuth();
  const { error } = await supabase
    .from("candidate_links")
    .delete()
    .eq("id", id)
    .eq("candidate_id", uid);
  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// ------------------------------------------------------------------ Resume
export async function uploadResume(formData: FormData): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a PDF file." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Only PDF files are allowed." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "File must be under 5 MB." };
  }

  const { supabase, uid } = await getAuth();
  const path = `${uid}/resume.pdf`;

  const { error: upErr } = await supabase.storage
    .from("resumes")
    .upload(path, file, { upsert: true, contentType: "application/pdf" });
  if (upErr) return { ok: false, error: upErr.message };

  const docRow = {
    candidate_id: uid,
    type: "resume" as const,
    file_path: path,
    file_name: file.name,
    mime_type: "application/pdf",
    size_bytes: file.size,
    uploaded_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("candidate_documents")
    .select("id")
    .eq("candidate_id", uid)
    .eq("type", "resume")
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("candidate_documents")
        .update(docRow)
        .eq("id", existing.id)
    : await supabase.from("candidate_documents").insert(docRow);

  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

export async function getResumeDownloadUrl(): Promise<string | null> {
  const { supabase, uid } = await getAuth();
  const { data } = await supabase.storage
    .from("resumes")
    .createSignedUrl(`${uid}/resume.pdf`, 60 * 5);
  return data?.signedUrl ?? null;
}

export async function removeResume(): Promise<ActionResult> {
  const { supabase, uid } = await getAuth();
  await supabase.storage.from("resumes").remove([`${uid}/resume.pdf`]);
  const { error } = await supabase
    .from("candidate_documents")
    .delete()
    .eq("candidate_id", uid)
    .eq("type", "resume");
  if (error) return mapDbError(error);
  revalidateCandidate();
  return { ok: true };
}

// --------------------------------------------------------- Change password
export async function changePassword(
  input: ChangePasswordInput,
): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { supabase, email } = await getAuth();
  if (!email) return { ok: false, error: "No email on this account." };

  // Verify the current password by re-authenticating.
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.currentPassword,
  });
  if (signErr) {
    return {
      ok: false,
      fieldErrors: { currentPassword: ["Current password is incorrect."] },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
