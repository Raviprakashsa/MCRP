import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Candidate,
  CandidateDocument,
  CandidateLink,
  CandidateSkill,
  Education,
  Experience,
  Preferences,
  Project,
  ProfileBundle,
  SkillOption,
} from "./types";

/** The authenticated user, or null. Cached per request. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The current candidate profile (own row via RLS), or null. */
export const getCandidate = cache(async (): Promise<Candidate | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidates")
    .select(
      "id, candidate_code, full_name, email, mobile, whatsapp, date_of_birth, gender, address, city, state, pin_code, status, registration_status, profile_completion, email_verified, mobile_verified",
    )
    .maybeSingle()
    .returns<Candidate>();
  return data;
});

/** Require an authenticated candidate; redirect to login otherwise. */
export async function requireCandidate(): Promise<Candidate> {
  const user = await getUser();
  if (!user) redirect("/login");

  const candidate = await getCandidate();
  if (!candidate) {
    // Authenticated, but no profile row exists (e.g. the database hasn't been
    // migrated yet, or the new-user trigger failed). Signing out avoids an
    // auth↔profile redirect loop and surfaces a clear error on the login page.
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?error=profile_setup");
  }
  return candidate;
}

/** Everything needed to render the profile/dashboard for the current user. */
export async function getProfileBundle(): Promise<ProfileBundle> {
  const candidate = await requireCandidate();
  const supabase = await createClient();

  const [education, skills, projects, experiences, links, preferences, resume] =
    await Promise.all([
      supabase
        .from("candidate_education")
        .select(
          "id, college_id, college_name, university, degree, branch, specialization, current_semester, passing_year, score_type, score_value, backlogs, is_primary",
        )
        .order("is_primary", { ascending: false })
        .returns<Education[]>(),
      supabase
        .from("candidate_skills")
        .select(
          "id, skill_id, proficiency, years_experience, skill:skills(name, category)",
        )
        .returns<CandidateSkill[]>(),
      supabase
        .from("candidate_projects")
        .select("id, title, description, tech_stack, project_url, repo_url")
        .order("created_at", { ascending: true })
        .returns<Project[]>(),
      supabase
        .from("candidate_experiences")
        .select(
          "id, type, organization, title, description, location, start_date, end_date, is_current",
        )
        .order("start_date", { ascending: false, nullsFirst: false })
        .returns<Experience[]>(),
      supabase
        .from("candidate_links")
        .select("id, platform, url, label")
        .returns<CandidateLink[]>(),
      supabase
        .from("candidate_preferences")
        .select(
          "candidate_id, preferred_role, preferred_location, ready_to_relocate, expected_ctc, immediate_joining, notice_period_days",
        )
        .maybeSingle()
        .returns<Preferences>(),
      supabase
        .from("candidate_documents")
        .select(
          "id, type, file_path, file_name, mime_type, size_bytes, uploaded_at",
        )
        .eq("type", "resume")
        .maybeSingle()
        .returns<CandidateDocument>(),
    ]);

  return {
    candidate,
    education: education.data ?? [],
    skills: skills.data ?? [],
    projects: projects.data ?? [],
    experiences: experiences.data ?? [],
    links: links.data ?? [],
    preferences: preferences.data ?? null,
    resume: resume.data ?? null,
  };
}

/** A short-lived signed URL to view/download the resume (private bucket). */
export async function getResumeSignedUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 5);
  return data?.signedUrl ?? null;
}

/** The skills master list for the picker. */
export const getSkillOptions = cache(async (): Promise<SkillOption[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("id, name, category")
    .order("name")
    .returns<SkillOption[]>();
  return data ?? [];
});
