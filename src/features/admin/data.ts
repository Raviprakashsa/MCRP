import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/features/candidate/data";
import type {
  Candidate,
  CandidateDocument,
  CandidateLink,
  CandidateSkill,
  Education,
  Experience,
  Preferences,
  ProfileBundle,
  Project,
} from "@/features/candidate/types";
import type {
  AdminRole,
  AdminStats,
  CandidateFilters,
  CandidateListRow,
} from "./types";
import { PAGE_SIZE } from "./types";

/** The current user's role (own row via RLS). */
export const getRole = cache(async (): Promise<AdminRole | "candidate"> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .maybeSingle<{ role: AdminRole | "candidate" }>();
  return data?.role ?? "candidate";
});

/** Require an admin/super_admin; redirect otherwise. */
export async function requireAdmin(): Promise<{ role: AdminRole }> {
  const user = await getUser();
  if (!user) redirect("/login");
  const role = await getRole();
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");
  return { role };
}

/** Strip characters that would break a PostgREST `or`/`ilike` filter. */
function sanitize(value: string): string {
  return value.replace(/[,%()\\*]/g, " ").trim();
}

/** Dashboard counts (admin can read all via RLS). */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const base = () =>
    supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

  const [total, completed, withResume, newThisWeek] = await Promise.all([
    base(),
    base().eq("profile_completion", 100),
    base().eq("registration_status", "resume_uploaded"),
    base().gte("created_at", weekAgo),
  ]);

  return {
    total: total.count ?? 0,
    completed: completed.count ?? 0,
    withResume: withResume.count ?? 0,
    newThisWeek: newThisWeek.count ?? 0,
  };
}

/** Paginated, filtered candidate list for the admin table. */
export async function listCandidates(filters: CandidateFilters): Promise<{
  rows: CandidateListRow[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("candidates")
    .select(
      "id, candidate_code, full_name, email, mobile, city, state, status, registration_status, profile_completion, created_at, education:candidate_education(college_name, branch, degree, passing_year, is_primary)",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (filters.q) {
    const q = sanitize(filters.q);
    if (q) {
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,mobile.ilike.%${q}%,candidate_code.ilike.%${q}%`,
      );
    }
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.registration_status)
    query = query.eq("registration_status", filters.registration_status);
  if (filters.city) query = query.ilike("city", `%${sanitize(filters.city)}%`);
  if (filters.state)
    query = query.ilike("state", `%${sanitize(filters.state)}%`);

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
    .returns<CandidateListRow[]>();

  const total = count ?? 0;
  return {
    rows: data ?? [],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Full profile of one candidate (admin reads any via RLS). */
export async function getCandidateDetail(
  id: string,
): Promise<ProfileBundle | null> {
  const supabase = await createClient();

  const { data: candidate } = await supabase
    .from("candidates")
    .select(
      "id, candidate_code, full_name, email, mobile, whatsapp, date_of_birth, gender, address, city, state, pin_code, status, registration_status, profile_completion, email_verified, mobile_verified",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()
    .returns<Candidate>();

  if (!candidate) return null;

  const [education, skills, projects, experiences, links, preferences, resume] =
    await Promise.all([
      supabase
        .from("candidate_education")
        .select(
          "id, college_id, college_name, university, degree, branch, specialization, current_semester, passing_year, score_type, score_value, backlogs, is_primary",
        )
        .eq("candidate_id", id)
        .order("is_primary", { ascending: false })
        .returns<Education[]>(),
      supabase
        .from("candidate_skills")
        .select(
          "id, skill_id, proficiency, years_experience, skill:skills(name, category)",
        )
        .eq("candidate_id", id)
        .returns<CandidateSkill[]>(),
      supabase
        .from("candidate_projects")
        .select("id, title, description, tech_stack, project_url, repo_url")
        .eq("candidate_id", id)
        .returns<Project[]>(),
      supabase
        .from("candidate_experiences")
        .select(
          "id, type, organization, title, description, location, start_date, end_date, is_current",
        )
        .eq("candidate_id", id)
        .returns<Experience[]>(),
      supabase
        .from("candidate_links")
        .select("id, platform, url, label")
        .eq("candidate_id", id)
        .returns<CandidateLink[]>(),
      supabase
        .from("candidate_preferences")
        .select(
          "candidate_id, preferred_role, preferred_location, ready_to_relocate, expected_ctc, immediate_joining, notice_period_days",
        )
        .eq("candidate_id", id)
        .maybeSingle()
        .returns<Preferences>(),
      supabase
        .from("candidate_documents")
        .select(
          "id, type, file_path, file_name, mime_type, size_bytes, uploaded_at",
        )
        .eq("candidate_id", id)
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

/** Signed URL for a specific candidate's resume (admin storage RLS). */
export async function getCandidateResumeUrl(
  candidateId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("resumes")
    .createSignedUrl(`${candidateId}/resume.pdf`, 60 * 5);
  return data?.signedUrl ?? null;
}
