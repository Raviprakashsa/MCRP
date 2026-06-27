# Phase 1 — Business Analysis & Discovery

**Project:** Magnus Copo Registration (MCR)
**Status:** Phase 1 of 7 — Discovery & Requirements (NO code, NO final architecture yet)
**Last updated:** 2026-06-27

---

## 1. How I Understand Your Business (validate this)

Magnus Copo is a **talent / placement company** operating in the Indian market. Your
core value is **data + matching**: you collect candidate information, maintain
company and job data, and connect the right candidate to the right company.

Service lines:
- Placement services
- Student training
- Recruitment
- College hiring programs
- Corporate hiring
- Digital solutions ("Skelo" appears to be a separate product/brand — needs clarification)

**Core problem to solve:** today the "system of record" is scattered Excel files
and Google Sheets. That causes duplication, inconsistency, no search, no analytics,
no follow-up tracking, and heavy manual work. You want **one reliable system of
record** that is candidate-facing (registration + dashboard) and admin-facing
(management + matching + analytics).

**Key architectural tension I have already spotted (and we must resolve in Phase 2):**
You want it designed "for millions of candidates, thousands of companies, hundreds
of colleges" **but** you are non-technical, have no team, and need low monthly cost.
These two goals are not automatically compatible. The resolution is to **design the
data model and architecture for scale, but deploy on a cheap managed platform now,
with a clear, pre-planned migration path.** We do NOT over-build infrastructure on
day one. I will justify this fully in Phase 2.

---

## 2. Assumptions I am Challenging (my job as your CTO)

These are decisions you stated or implied that I believe deserve a second look.
None are final — they are for discussion.

### Challenge 1 — "Collect maximum information at registration"
Asking for 80+ fields up front will **destroy your signup conversion**. Students
abandon long forms. The professional pattern is **progressive profiling**:
- **Step 1 (mandatory, ~60 seconds):** name, mobile, email, password. Account created.
- **Step 2+ (encouraged, gamified):** education, skills, links, documents — driven
  by a "Profile Completion %" meter and unlocked features.

You still collect *everything* — just not all at once. This **increases**
completed profiles, which is what your AI matching actually needs.

### Challenge 2 — Collecting Aadhaar & PAN at registration
This is the single biggest risk in your spec. Aadhaar and PAN are highly sensitive
identifiers. Under India's **DPDP Act 2023**, storing them creates legal liability,
breach-notification duties, and data-minimisation obligations. Most candidates will
also distrust a careers portal asking for Aadhaar to *register*.

**My recommendation:** do NOT collect Aadhaar/PAN at registration. Collect them
**only at the offer/onboarding stage**, for candidates who are actually being
placed, with explicit consent — ideally stored encrypted or via a verification
provider rather than raw. We must confirm you genuinely need them at all.

### Challenge 3 — Self-rated skills for AI matching
"Skill rating" entered by the candidate is the weakest possible signal — everyone
rates themselves 8/10. For credible AI matching you want **verifiable signals**:
linked LeetCode/HackerRank/GitHub activity, certifications with IDs, project
evidence, and (later) test scores. We should design skills as structured,
evidence-backed records, not just a number.

### Challenge 4 — "Build everything" in one go
The deliverable list (WhatsApp, SMS, email templates, PDF/Excel export, bulk
import, audit logs, AI modules, resume generation, chat-with-profile…) is a
**multi-year roadmap**, not an MVP. Trying to build all of it at once is the
classic way these projects die. Phase 6 will sequence this into MVP → V1 → V2 → V3.
WhatsApp Business API and SMS in particular carry real cost and compliance overhead
and should NOT be in the MVP.

### Challenge 5 — "Companies never log in" — forever?
You said companies are managed internally. That's right for V1 and simpler/safer.
But long term, a **company/HR portal** (read-only shortlists, interview feedback)
is often where placement businesses add value and revenue. I'll design the data
model so this can be added later **without** a rewrite — but confirm it's
out of scope for now.

---

## 3. Critical Questions — these BLOCK architecture decisions

Please answer as many as you can. The ones marked 🔴 most directly determine the
final technology and cost, so prioritise those.

### A. Scale & Budget (drives the entire architecture)
1. 🔴 **Realistically, how many candidates will register in the first 12 months?**
   (e.g. 500? 5,000? 50,000?) — the honest near-term number, not the dream number.
2. 🔴 **What is your maximum comfortable monthly spend** on hosting/software in
   the first year? Give a real ceiling in ₹ (e.g. "under ₹1,000/mo",
   "under ₹5,000/mo", "₹15,000/mo is fine").
3. How many internal admins/staff will use the admin panel? Just you, or a team?
4. How many colleges and how many companies are you actively working with **today**?

### B. Team & Maintenance
5. 🔴 Going forward, will it genuinely be **only you + AI** maintaining this, or is
   there any developer (even part-time/freelance) you can call on?
6. Are you comfortable with a **managed platform** (someone else runs the servers,
   you click in a dashboard) versus self-hosting (you manage a server)? I strongly
   expect managed is right for you — confirming.
7. How important is it that you can **read/export the raw data yourself** at any
   time (e.g. open it like a spreadsheet) for peace of mind?

### C. Existing Assets
8. 🔴 **magnuscopo.com** — does the website already exist? If so, **where is it
   hosted and what is it built with** (WordPress? Wix? custom? something else)?
   This decides whether the portal lives at `/careers` on the same site or at
   `careers.magnuscopo.com` as a separate app.
9. 🔴 **What is "Skelo"?** It appears in the candidate dashboard ("Skelo Access").
   Is it an existing product of yours, a separate app, a brand? How does it relate?
10. Do you have existing candidate data in Sheets that must be **migrated in**?
    Roughly how many records, and how clean/consistent is it?
11. Do you have brand assets — logo, brand colours, fonts, any existing design?

### D. Authentication & Access (India-specific)
12. 🔴 How should candidates **sign up and log in**? Options (can combine):
    email + password, **mobile OTP** (very common/expected in India),
    **Google login**. What do you prefer for the primary method?
13. Should there be different **admin roles** (e.g. Super Admin, Placement Officer,
    Data Entry, Viewer), or is a single admin level fine for now?

### E. Communications (cost & compliance implications)
14. 🔴 For the MVP, which notification channels are **must-have** vs nice-to-later?
    - Email (cheap, easy) —
    - SMS (paid per message, needs DLT registration in India) —
    - WhatsApp (Business API, paid, approval process) —
15. Do you already have any of these set up (an email domain, an SMS/WhatsApp
    provider account)?

### F. Documents & Compliance
16. 🔴 Confirm: are you OK to **defer Aadhaar/PAN** to the placement stage
    (Challenge 2), or do you have a specific reason to collect them at registration?
17. Which documents are truly needed at registration? (My default: **Resume + Photo
    only**; marks cards/certificates uploaded as candidates progress.)
18. Are all candidates in **India**, or do you expect international candidates
    (this decides GDPR vs DPDP-only scope)?

### G. Core Workflow (so the product fits how you actually work)
19. When a candidate clicks **Apply**, what happens next *inside Magnus Copo*?
    Who reviews it, and what are the **status stages** (e.g. Applied → Shortlisted →
    Sent to Company → Interview → Selected → Joined / Rejected)? Describe your real
    process even if informal.
20. For **matching**, in the near term do you mainly need powerful **manual
    filtering/search/ranking** (you choose candidates), with **AI auto-recommendation
    coming later**? Confirming the sequencing.

### H. Business Model (helps me prioritise)
21. Who pays Magnus Copo — **companies**, **colleges**, **candidates**, or a mix?
    This tells me which features create revenue and should come first.
22. Is there any deadline or event (a placement season, a college tie-up, a demo
    to a client) that the **first usable version** must be ready for?

---

## 4. Additional Fields I Recommend (beyond your list)

For richer future AI analysis, consider adding (we'll finalise in Phase 3):
- **Identity/meta:** registration source (which college/campaign), referral code,
  preferred language, consent timestamps & version (for DPDP audit).
- **Education depth:** 10th %, 12th %, education gap years, medium of instruction,
  multiple degrees (PG), academic achievements/ranks.
- **Skills as structured records:** skill + proficiency + years + last-used +
  evidence link, rather than free text. Enables real matching.
- **Projects as structured records:** title, description, role, tech stack, links,
  duration — each its own row, not one text box.
- **Work/internship as structured records:** company, role, dates, stipend/CTC,
  description — each its own row.
- **Career signals:** willing to relocate (Y/N + cities), expected vs minimum CTC,
  current status (studying / available / placed elsewhere), placement readiness score.
- **Engagement/behaviour (for AI):** profile completeness %, last active, jobs
  viewed, applications made, response rate — your richest future ML features.
- **Verification flags:** email verified, phone verified, documents verified,
  profile verified-by-admin.

---

## 5. What Happens After You Answer

Once I have your answers (especially the 🔴 ones), I will produce **Phase 2**:
a full architecture document with a **side-by-side comparison** of Google Sheets,
Supabase, Firebase, PocketBase, Appwrite, raw PostgreSQL/Neon, PlanetScale,
Cloudflare, SQLite, and MongoDB — scored on cost, scalability, maintenance,
AI-friendliness, deployment difficulty, backup, security, and future expansion —
ending in **one recommended architecture with full justification**.

I already have a strong preliminary leaning based on your constraints
(non-technical, low cost, AI-friendly, must-own-your-data, scalable later), but I
will not commit until your answers confirm the key variables — that would be making
exactly the kind of assumption you told me not to make.
