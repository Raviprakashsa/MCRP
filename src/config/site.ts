/**
 * Central, typed site configuration. Single source of truth for brand strings,
 * the public URL, and metadata reused across the app (layout, emails, etc.).
 */
export const siteConfig = {
  name: "Magnus Copo Careers",
  shortName: "Magnus Copo",
  description:
    "Register with Magnus Copo — create your candidate profile, upload your resume, and keep your details up to date for placement opportunities.",
  url: "https://careers.magnuscopo.com",
  company: "Magnus Copo",
} as const;

export type SiteConfig = typeof siteConfig;
