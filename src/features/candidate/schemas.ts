import { z } from "zod";

const mobileRegex = /^(?:\+91)?[6-9]\d{9}$/;
const currentYear = new Date().getFullYear();

/** Treat "", null, and NaN as "not provided". */
const blankToUndef = (v: unknown) =>
  v === "" || v === null || (typeof v === "number" && Number.isNaN(v))
    ? undefined
    : v;

const optionalMobile = z
  .string()
  .trim()
  .regex(mobileRegex, "Enter a valid 10-digit number")
  .optional()
  .or(z.literal(""));

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

// ---------------------------------------------------------------- Personal
export const personalSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  mobile: z.string().trim().regex(mobileRegex, "Enter a valid 10-digit mobile"),
  whatsapp: optionalMobile,
  date_of_birth: z.string().trim().optional().or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.literal("")),
  address: optionalText(300),
  city: z.string().trim().min(1, "Enter your city").max(80),
  state: z.string().trim().min(1, "Enter your state").max(80),
  pin_code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN")
    .optional()
    .or(z.literal("")),
});
export type PersonalInput = z.infer<typeof personalSchema>;

// --------------------------------------------------------------- Education
export const educationSchema = z.object({
  college_name: z.string().trim().min(2, "Enter your college").max(160),
  university: optionalText(160),
  degree: z.string().trim().min(1, "Enter your degree").max(80),
  branch: optionalText(80),
  specialization: optionalText(80),
  current_semester: z.preprocess(
    blankToUndef,
    z.coerce.number().int().min(1).max(12).optional(),
  ),
  passing_year: z.preprocess(
    blankToUndef,
    z.coerce
      .number({ error: "Enter your passing year" })
      .int()
      .min(1980, "Enter a valid year")
      .max(currentYear + 8, "Enter a valid year"),
  ),
  score_type: z.enum(["cgpa", "percentage"]).optional().or(z.literal("")),
  score_value: z.preprocess(
    blankToUndef,
    z.coerce.number().min(0).max(100).optional(),
  ),
  backlogs: z.preprocess(
    blankToUndef,
    z.coerce.number().int().min(0).max(50).optional(),
  ),
});
export type EducationInput = z.infer<typeof educationSchema>;
export type EducationFormValues = z.input<typeof educationSchema>;

// ------------------------------------------------------------------- Skill
export const skillSchema = z.object({
  skill_id: z.uuid("Choose a skill"),
  proficiency: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional()
    .or(z.literal("")),
  years_experience: z.preprocess(
    blankToUndef,
    z.coerce.number().min(0).max(50).optional(),
  ),
});
export type SkillInput = z.infer<typeof skillSchema>;

// ----------------------------------------------------------------- Project
export const projectSchema = z.object({
  title: z.string().trim().min(2, "Enter a project title").max(160),
  description: optionalText(2000),
  tech_stack: optionalText(300),
  project_url: z.url("Enter a valid URL").optional().or(z.literal("")),
  repo_url: z.url("Enter a valid URL").optional().or(z.literal("")),
});
export type ProjectInput = z.infer<typeof projectSchema>;

// -------------------------------------------------------------- Experience
export const experienceSchema = z.object({
  type: z.enum(["internship", "freelance", "work", "startup"]),
  organization: z.string().trim().min(2, "Enter the organization").max(160),
  title: optionalText(120),
  description: optionalText(2000),
  location: optionalText(120),
  start_date: z.string().trim().optional().or(z.literal("")),
  end_date: z.string().trim().optional().or(z.literal("")),
  is_current: z.boolean().optional(),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

// -------------------------------------------------------------------- Link
export const linkSchema = z.object({
  platform: z.enum([
    "github",
    "linkedin",
    "portfolio",
    "hackerrank",
    "leetcode",
    "codechef",
    "kaggle",
    "other",
  ]),
  url: z.url("Enter a valid URL"),
  label: optionalText(60),
});
export type LinkInput = z.infer<typeof linkSchema>;

// ------------------------------------------------------------- Preferences
export const preferencesSchema = z.object({
  preferred_role: z.string().trim().min(2, "Enter a preferred role").max(120),
  preferred_location: optionalText(120),
  ready_to_relocate: z.boolean().optional(),
  expected_ctc: z.preprocess(
    blankToUndef,
    z.coerce.number().min(0).max(100000000).optional(),
  ),
  immediate_joining: z.boolean().optional(),
  notice_period_days: z.preprocess(
    blankToUndef,
    z.coerce.number().int().min(0).max(365).optional(),
  ),
});
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type PreferencesFormValues = z.input<typeof preferencesSchema>;

// ----------------------------------------------------------- Change password
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Za-z]/, "Include a letter")
      .regex(/\d/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
