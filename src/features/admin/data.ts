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
  AuditLogRow,
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

const EMPTY_UUID = "00000000-0000-0000-0000-000000000000";

type DbClient = Awaited<ReturnType<typeof createClient>>;

/**
 * For filters on related tables (college/branch/year via education, skill via
 * candidate_skills), resolve the set of matching candidate ids and intersect.
 * Returns null when no related-table filter is active.
 */
async function advancedIdFilter(
  supabase: DbClient,
  filters: CandidateFilters,
): Promise<string[] | null> {
  const idSets: string[][] = [];

  if (filters.college || filters.branch || filters.passing_year) {
    let eq = supabase.from("candidate_education").select("candidate_id");
    if (filters.college)
      eq = eq.ilike("college_name", `%${sanitize(filters.college)}%`);
    if (filters.branch)
      eq = eq.ilike("branch", `%${sanitize(filters.branch)}%`);
    if (filters.passing_year) {
      const year = parseInt(filters.passing_year, 10);
      if (!Number.isNaN(year)) eq = eq.eq("passing_year", year);
    }
    const { data } = await eq.returns<{ candidate_id: string }[]>();
    idSets.push([...new Set((data ?? []).map((r) => r.candidate_id))]);
  }

  if (filters.skill) {
    const { data } = await supabase
      .from("candidate_skills")
      .select("candidate_id, skills!inner(name)")
      .ilike("skills.name", `%${sanitize(filters.skill)}%`)
      .returns<{ candidate_id: string }[]>();
    idSets.push([...new Set((data ?? []).map((r) => r.candidate_id))]);
  }

  if (idSets.length === 0) return null;

  let result = idSets[0];
  for (let i = 1; i < idSets.length; i++) {
    const set = new Set(idSets[i]);
    result = result.filter((id) => set.has(id));
  }
  return result;
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

  const ids = await advancedIdFilter(supabase, filters);
  if (ids) query = query.in("id", ids.length ? ids : [EMPTY_UUID]);

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

type ExportQueryRow = {
  candidate_code: string;
  full_name: string;
  email: string;
  mobile: string | null;
  whatsapp: string | null;
  gender: string | null;
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  status: string;
  registration_status: string;
  profile_completion: number;
  created_at: string;
  education: {
    college_name: string | null;
    university: string | null;
    degree: string | null;
    branch: string | null;
    specialization: string | null;
    passing_year: number | null;
    score_type: string | null;
    score_value: number | null;
    is_primary: boolean;
  }[];
};

/** Flattened candidate rows matching the filters, for CSV/Excel export (capped). */
export async function fetchCandidatesForExport(
  filters: CandidateFilters,
): Promise<Record<string, string | number>[]> {
  const supabase = await createClient();

  let query = supabase
    .from("candidates")
    .select(
      "candidate_code, full_name, email, mobile, whatsapp, gender, date_of_birth, city, state, pin_code, status, registration_status, profile_completion, created_at, education:candidate_education(college_name, university, degree, branch, specialization, passing_year, score_type, score_value, is_primary)",
    )
    .is("deleted_at", null);

  if (filters.q) {
    const q = sanitize(filters.q);
    if (q)
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,mobile.ilike.%${q}%,candidate_code.ilike.%${q}%`,
      );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.registration_status)
    query = query.eq("registration_status", filters.registration_status);
  if (filters.city) query = query.ilike("city", `%${sanitize(filters.city)}%`);
  if (filters.state)
    query = query.ilike("state", `%${sanitize(filters.state)}%`);

  const ids = await advancedIdFilter(supabase, filters);
  if (ids) query = query.in("id", ids.length ? ids : [EMPTY_UUID]);

  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(5000)
    .returns<ExportQueryRow[]>();

  return (data ?? []).map((c) => {
    const edu = c.education.find((e) => e.is_primary) ?? c.education[0] ?? null;
    return {
      "Candidate ID": c.candidate_code,
      "Full Name": c.full_name,
      Email: c.email,
      Mobile: c.mobile ?? "",
      WhatsApp: c.whatsapp ?? "",
      Gender: c.gender ?? "",
      "Date of Birth": c.date_of_birth ?? "",
      City: c.city ?? "",
      State: c.state ?? "",
      PIN: c.pin_code ?? "",
      College: edu?.college_name ?? "",
      University: edu?.university ?? "",
      Degree: edu?.degree ?? "",
      Branch: edu?.branch ?? "",
      Specialization: edu?.specialization ?? "",
      "Passing Year": edu?.passing_year ?? "",
      Score:
        edu?.score_value != null
          ? `${edu.score_value} ${edu.score_type ?? ""}`.trim()
          : "",
      "Profile %": c.profile_completion,
      Status: c.status,
      Stage: c.registration_status,
      "Registered On": c.created_at.slice(0, 10),
    };
  });
}

/** Paginated audit log (admin read). */
export async function getAuditLogs(page = 1): Promise<{
  rows: AuditLogRow[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const supabase = await createClient();
  const from = (Math.max(1, page) - 1) * PAGE_SIZE;
  const { data, count } = await supabase
    .from("audit_logs")
    .select("id, actor_id, action, entity, entity_id, changes, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
    .returns<AuditLogRow[]>();

  const total = count ?? 0;
  return {
    rows: data ?? [],
    total,
    page: Math.max(1, page),
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
