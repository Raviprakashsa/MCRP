import { z } from "zod";

/** India mobile: 10 digits starting 6-9, optional +91 / leading 0 stripped by app. */
const mobileRegex = /^(?:\+91)?[6-9]\d{9}$/;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Please enter your full name").max(120),
    email: z.email("Enter a valid email").trim().toLowerCase(),
    mobile: z
      .string()
      .trim()
      .regex(mobileRegex, "Enter a valid 10-digit Indian mobile number"),
    whatsapp: z
      .string()
      .trim()
      .regex(mobileRegex, "Enter a valid 10-digit number")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string(),
    consent: z.literal(true, {
      error: "You must accept the privacy policy to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyOtpSchema = z.object({
  email: z.email().trim().toLowerCase(),
  token: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
