// Domain types for the candidate portal. These mirror the database schema
// (docs/phase-3) and are used to type Supabase reads via `.returns<T>()`.

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type RegistrationStatus =
  | "registered"
  | "email_verified"
  | "profile_started"
  | "resume_uploaded"
  | "profile_completed";

export type SkillCategory =
  | "programming_language"
  | "framework"
  | "database"
  | "tool"
  | "cloud_platform"
  | "soft_skill"
  | "other";

export type Proficiency = "beginner" | "intermediate" | "advanced" | "expert";

export type ExperienceType = "internship" | "freelance" | "work" | "startup";

export type LinkPlatform =
  | "github"
  | "linkedin"
  | "portfolio"
  | "hackerrank"
  | "leetcode"
  | "codechef"
  | "kaggle"
  | "other";

export type ScoreType = "cgpa" | "percentage";

export type Candidate = {
  id: string;
  candidate_code: string;
  full_name: string;
  email: string;
  mobile: string | null;
  whatsapp: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  status: "active" | "disabled";
  registration_status: RegistrationStatus;
  profile_completion: number;
  email_verified: boolean;
  mobile_verified: boolean;
};

export type Education = {
  id: string;
  college_id: string | null;
  college_name: string | null;
  university: string | null;
  degree: string | null;
  branch: string | null;
  specialization: string | null;
  current_semester: number | null;
  passing_year: number | null;
  score_type: ScoreType | null;
  score_value: number | null;
  backlogs: number;
  is_primary: boolean;
};

export type CandidateSkill = {
  id: string;
  skill_id: string;
  proficiency: Proficiency | null;
  years_experience: number | null;
  skill: { name: string; category: SkillCategory } | null;
};

export type Project = {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  project_url: string | null;
  repo_url: string | null;
};

export type Experience = {
  id: string;
  type: ExperienceType;
  organization: string;
  title: string | null;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
};

export type CandidateLink = {
  id: string;
  platform: LinkPlatform;
  url: string;
  label: string | null;
};

export type Preferences = {
  candidate_id: string;
  preferred_role: string | null;
  preferred_location: string | null;
  ready_to_relocate: boolean | null;
  expected_ctc: number | null;
  immediate_joining: boolean | null;
  notice_period_days: number | null;
};

export type CandidateDocument = {
  id: string;
  type: "resume" | "other";
  file_path: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_at: string;
};

export type SkillOption = {
  id: string;
  name: string;
  category: SkillCategory;
};

export type CollegeOption = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

export type ProfileBundle = {
  candidate: Candidate;
  education: Education[];
  skills: CandidateSkill[];
  projects: Project[];
  experiences: Experience[];
  links: CandidateLink[];
  preferences: Preferences | null;
  resume: CandidateDocument | null;
};
