import type { RegistrationStatus } from "@/features/candidate/types";

export type AdminRole = "admin" | "super_admin";

export type CandidateListRow = {
  id: string;
  candidate_code: string;
  full_name: string;
  email: string;
  mobile: string | null;
  city: string | null;
  state: string | null;
  status: "active" | "disabled";
  registration_status: RegistrationStatus;
  profile_completion: number;
  created_at: string;
  education: {
    college_name: string | null;
    branch: string | null;
    degree: string | null;
    passing_year: number | null;
    is_primary: boolean;
  }[];
};

export type CandidateFilters = {
  q?: string;
  status?: string;
  registration_status?: string;
  city?: string;
  state?: string;
  college?: string;
  branch?: string;
  skill?: string;
  passing_year?: string;
  page?: number;
};

export type AuditLogRow = {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
};

export type AdminStats = {
  total: number;
  completed: number;
  withResume: number;
  newThisWeek: number;
};

export const PAGE_SIZE = 20;
