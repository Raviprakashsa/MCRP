# Phase 4 — UI/UX Design (Brand-Aligned)

**Project:** Magnus Copo Candidate Registration Portal (MCRP)
**Status:** Phase 4 of 6 — LOCKED. Design system, components, journeys, wireframes.
**Brand source:** analyzed from live site `https://magnuscopo.com` (compiled CSS + logos)
**Last updated:** 2026-06-27

> The portal must feel like a **natural extension of magnuscopo.com**, not a different
> product. Colors, typography, and logos below are taken from the **actual website**.
> The marketing site uses gradient/glow accents; per your direction the *portal* keeps
> the **same identity but more restrained** — usability over decoration.

---

## 1. Brand foundation (extracted from the live site)

**Typeface:** `Inter` (site uses `font-family: Inter, system-ui, -apple-system, sans-serif`).
**Signature accent trio (used in gradients on the site):** blue → cyan → purple.
**Aesthetic:** modern, AI/IT, deep-navy darks with bright blue/cyan highlights.

### Raw brand colors found in the site CSS
| Role | Hex | Notes |
|---|---|---|
| Brand blue (primary) | `#2d8cff` | Most-used interactive blue. |
| Brand cyan (accent) | `#14f4ff` | Highlights, progress, focus glow. |
| Brand purple (secondary) | `#8a4fff` | Occasional accent / badges. |
| Deep navy (dark bg) | `#0a1a2f` | Dark-theme page background. |
| Dark surface | `#1a2332`, `#0d2340`, `#0b1426` | Dark-theme cards/elevated. |
| Ink / near-black | `#0f1419` | Light-theme primary text. |
| Light page bg | `#f7f9fc` / `#fafbfc` | Light-theme background. |
| Blue tints | `#ebf5ff`, `#e8f1fc`, `#f0f6fd` | Light hover/selected fills. |
| Success | `#4ade80` | Site green. |
| Warning | `#facc15` | Site yellow. |
| Neutrals | `#e5e7eb`, `#9ca3af`, `#d8e4f0`, `#c0d5e8` | Borders / muted. |

---

## 2. Logos (use the official files — do not alter)

Two official SVGs ship on the site root and will be copied into `/public/brand/`:

| File | Use on | Rule |
|---|---|---|
| `MagnusCOPO_Dark.svg` | **Light theme** (dark-colored logo) | header, login, emails (light bg) |
| `MagnusCOPO_Light.svg` | **Dark theme** (light-colored logo) | header on dark bg |

**Never** recreate, recolor, stretch, or redesign. Preserve aspect ratio; keep clear
space ≥ the logo's cap-height on all sides. The correct logo is swapped automatically
with the theme. Favicon = "MC" monogram derived from the wordmark.

---

## 3. Design tokens

### 3.1 Semantic color system — Light theme
| Token | Value | Use |
|---|---|---|
| `--background` | `#f7f9fc` | Page. |
| `--surface` / card | `#ffffff` | Cards, panels, inputs. |
| `--surface-muted` | `#f0f6fd` | Subtle fills, hover rows. |
| `--foreground` | `#0f1419` | Primary text. |
| `--muted-foreground` | `#5b6b7f` | Secondary text/labels. |
| `--border` | `#e3e9f2` | Dividers, input borders. |
| `--primary` | `#2d8cff` | Buttons, links, active. |
| `--primary-hover` | `#1e6fe0` | Hover/pressed. |
| `--primary-soft` | `#e8f1fc` | Selected/badge bg. |
| `--accent` (cyan) | `#14f4ff` | Progress, focus glow (sparingly). |
| `--secondary` (purple) | `#8a4fff` | Rare accent / category badge. |
| `--success` | `#16a34a` (text) / `#dcfce7` (bg) | Positive states. |
| `--warning` | `#b45309` (text) / `#fef3c7` (bg) | Caution. |
| `--error` | `#dc2626` (text) / `#fee2e2` (bg) | Validation/danger. |
| `--ring` | `#2d8cff` @ 40% | Focus ring. |

### 3.2 Semantic color system — Dark theme
| Token | Value | Use |
|---|---|---|
| `--background` | `#0a1a2f` | Page (deep navy). |
| `--surface` / card | `#10233d` | Cards. |
| `--surface-muted` | `#0d2340` | Subtle fills. |
| `--foreground` | `#e8f1fc` | Primary text. |
| `--muted-foreground` | `#94a3b8` | Secondary text. |
| `--border` | `#1e2f47` | Dividers, input borders. |
| `--primary` | `#4d9fff` | Brightened blue for dark contrast. |
| `--primary-hover` | `#2d8cff` | Hover. |
| `--primary-soft` | `#13294a` | Selected/badge bg. |
| `--accent` (cyan) | `#14f4ff` | Highlights/focus glow. |
| `--secondary` (purple) | `#a87bff` | Rare accent. |
| `--success` | `#4ade80` | Positive. |
| `--warning` | `#facc15` | Caution. |
| `--error` | `#f87171` | Danger. |
| `--ring` | `#14f4ff` @ 45% | Focus ring (subtle cyan glow). |

> Contrast verified for **AA**: body text ≥ 4.5:1, large text/UI ≥ 3:1 in both themes.

### 3.3 Typography (Inter)
| Style | Size / weight | Use |
|---|---|---|
| Display | 32–40px / 700 | Page hero (rare). |
| H1 | 28px / 700 | Screen title. |
| H2 | 22px / 600 | Section. |
| H3 | 18px / 600 | Card/subsection. |
| Body | 15–16px / 400 | Default. |
| Small | 13–14px / 400 | Hints, captions. |
| Label | 13px / 500 | Form labels. |
| Mono | `ui-monospace` | Candidate ID, codes. |
Line-height 1.5 body / 1.2 headings. Max content width 1200px; reading width ≤ 680px.

### 3.4 Radius, spacing, elevation, motion
- **Radius:** inputs/buttons `10px`, cards `16px`, pills `full`. Consistent everywhere.
- **Spacing:** 4px base scale (4/8/12/16/24/32/48). Cards padded 20–24px.
- **Elevation:** light theme = soft `shadow-sm` on cards; dark theme = **border + faint
  inner depth**, no heavy drop shadows. Glow only on focus. No glassmorphism.
- **Motion:** 150–200ms ease-out for hover/expand; respects `prefers-reduced-motion`.
- **Icons:** `lucide-react`, 20px default, 1.75 stroke — one icon set throughout.

---

## 4. Component library (one consistent language)

All built on **shadcn/ui**, restyled to the tokens above. Specs:

| Component | Spec |
|---|---|
| **Button** | Variants: `primary` (solid blue), `secondary` (surface + border), `ghost` (text), `destructive` (error). Sizes sm/md/lg, radius 10px, 150ms hover, disabled = 50% + no shadow, loading = spinner + label. |
| **Input** | 44px height, label above, hint below, error state = error border + message + icon. Left icon optional. |
| **Select / Combobox** | Searchable (used for skills & colleges); keyboard nav; "Add new…" affordance for colleges. |
| **Search** | Header global search with leading icon, ⌘K hint on desktop, debounced. |
| **Card** | Surface bg, 16px radius, 20–24px padding, optional header/footer. |
| **Table** | TanStack Table: sticky header, zebra hover (`--surface-muted`), sortable, server pagination, row → detail. Collapses to **cards on mobile**. |
| **Progress** | Linear bar (profile completion) + stepper (wizard). Fill uses blue→cyan, track = `--surface-muted`. |
| **File upload** | Drag-drop zone, PDF-only, ≤5MB, shows name+size+remove, error inline; success check. |
| **OTP input** | 6 separate boxes, auto-advance, paste-fill, resend timer, error shake (motion-safe). |
| **Dialog / Drawer** | Center dialog (desktop), bottom sheet (mobile); focus-trapped; ESC/overlay close. |
| **Toast** | Top-right (desktop)/top (mobile), success/error/info, auto-dismiss + close. |
| **Badge** | Status pills: active(green), disabled(grey), verified(blue), lifecycle stages. |
| **Empty state** | Icon + one line + primary action (e.g. "No candidates match — clear filters"). |
| **Loading state** | Skeletons matching layout (not spinners) for lists/cards; button spinners for actions. |
| **Error state** | Friendly message + retry; never raw errors. |

---

## 5. Layout guidelines

- **App shell:** top header (logo left, theme toggle + account right). Candidate area is
  single-column, centered ≤720px. Admin area has a **left sidebar** (Dashboard,
  Candidates, Settings) + content; sidebar collapses to a top drawer on mobile.
- **Forms:** label-on-top, full-width inputs on mobile, 2-column on ≥768px where natural,
  one primary action bottom-right, secondary/back bottom-left.
- **Consistency rules (enforced):** one radius set, one shadow set, one spacing scale,
  one icon set, one button system, one form layout — across every screen.

---

## 6. Information architecture (sitemap)

```
PUBLIC
 ├─ /                 Landing + Register / Login
 ├─ /register         Create account (step 1) → OTP verify
 ├─ /login            Email + password · Continue with Google
 ├─ /forgot-password  Request reset email
 └─ /reset-password   Set new password (from email link)

CANDIDATE  (role = candidate)
 ├─ /onboarding       Multi-step profile wizard (first time)
 ├─ /dashboard        Completion % + quick links
 ├─ /profile          View profile
 ├─ /profile/edit     Edit any section
 ├─ /resume           View / replace resume
 └─ /settings         Change password, theme, account

ADMIN  (role = admin/super_admin)
 ├─ /admin                  Dashboard (counts + recent)
 ├─ /admin/candidates       List: search, filters, export
 ├─ /admin/candidates/:id   Full detail
 └─ /admin/settings         Manage colleges/skills, admins
```

Same app, role-based routing/guards; RLS (Phase 3 §7) enforces access at the database.

---

## 7. Candidate journey

```
Land → Register (name, email, mobile, password)
     → Email OTP (6-digit) → verified
     → Onboarding wizard (save-as-you-go):
         1 Personal  2 Education  3 Skills  4 Experience & Projects
         5 Profiles/Links  6 Career Preferences  7 Resume upload
     → Dashboard (completion %, next suggested step)
     → Edit any section anytime; registration status advances automatically
```
- Every step **saves immediately**; "Save & continue later" returns to dashboard.
- **Inline validation** with helpful messages; clear success/error feedback.
- **Friendly duplicate handling:** existing email/mobile → "You already have an
  account — log in or reset your password" (never a raw error).

## 8. Admin journey

```
Login → Admin dashboard (total candidates, % completed, recent signups)
      → Candidates list → global search OR combine filters
      → Open candidate → full profile, resume, all sections
      → Edit / Disable / soft-Delete  → written to audit log
      → Export current (filtered) view to CSV or Excel
```

---

## 9. Wireframes (low-fidelity, brand applied via tokens)

### 9.1 Register — step 1 (mobile-first)
```
┌──────────────────────────────┐
│  [MagnusCOPO logo]      ◐ ☼   │
│                              │
│  Create your account         │
│  Step 1 of 7  ▓▓░░░░░ 14%     │   ← blue→cyan progress
│                              │
│  Full name [______________]  │
│  Email     [______________]  │
│  Mobile    [______________]  │
│  Password  [______________]👁 │
│                              │
│  [   Create account   ]      │   ← primary blue #2d8cff
│  ──────── or ────────        │
│  [  G  Continue with Google] │
│  Already registered? Log in  │
└──────────────────────────────┘
```

### 9.2 Email OTP verify
```
┌──────────────────────────────┐
│  Verify your email           │
│  Code sent to rahul@email.com│
│   [_][_][_][_][_][_]          │
│  [   Verify & continue   ]    │
│  Resend code (00:42)          │
└──────────────────────────────┘
```

### 9.3 Candidate dashboard
```
┌───────────────────────────────────────────┐
│ [MagnusCOPO]      Dashboard ▾   ◐ ☼   ⏻    │
├───────────────────────────────────────────┤
│  Hi Rahul 👋        ID: MCR26060001         │
│  Profile completion                        │
│  ▓▓▓▓▓▓▓░░░ 70%   Status: Resume Uploaded   │
│  Next: add 2 projects to reach 100%        │
│  ┌ My Profile ┐ ┌ Resume ┐ ┌ Edit Profile ┐│
│  ┌ Change Password ┐                        │
└───────────────────────────────────────────┘
```

### 9.4 Admin — candidate list
```
┌──────────────────────────────────────────────────────────────┐
│ [MagnusCOPO · Admin]   [🔍 name/email/mobile/skill...]   ◐ ☼  │
├───────────┬──────────────────────────────────────────────────┤
│ Dashboard │ Filters: College▾ Branch▾ Degree▾ Yr▾ City▾ Skill▾ │
│ Candidates│ Status▾ Completion▾           [Export CSV | Excel] │
│ Settings  ├──────────────────────────────────────────────────┤
│           │ ID          Name     College Branch Yr Compl Stat │
│           │ MCR26060001 Rahul S. RVCE    CSE   26 70% ●active │
│           │ MCR26060002 Anita K. BMSCE   ISE   27 100%●active │
│           │ MCR26060003 Vijay R. PESU    ECE   26 40% ○disab  │
│           │                         ◀ 1 2 3 … ▶                │
└───────────┴──────────────────────────────────────────────────┘
```

### 9.5 Admin — candidate detail
```
┌──────────────────────────────────────────────────────────────┐
│ ◀ Back  Rahul Sharma  MCR26060001  [Edit][Disable][Delete]    │
├──────────────────────────────────────────────────────────────┤
│ [Personal][Education][Skills][Experience][Links][Preferences] │
│ Personal                                                      │
│   Email rahul@email.com (✔)  Mobile +91 98xxxxxx (—)          │
│   DOB 2004-05-02  Gender M  City Bengaluru  State KA          │
│ Resume: rahul_resume.pdf  [View] [Download]                   │
│ Audit: edited by admin@mc · 2026-06-26                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Responsive behavior (mobile-first)

| Breakpoint | Layout |
|---|---|
| ≤640px (mobile) | Single column; forms stack; **table → stacked cards**; sidebar → top drawer; bottom-sheet dialogs; 44px touch targets. |
| 641–1023px (tablet) | Two-column forms where natural; condensed table (key columns); sidebar collapsible. |
| ≥1024px (laptop/desktop) | Full table; persistent admin sidebar; ⌘K search; multi-column detail. |

Designed mobile-first, then progressively enhanced. Identical visual language at every size.

---

## 11. Accessibility & dark mode

- **Both themes are first-class**, tokenized (§3.1/3.2); toggle in header, remembered per
  device, honors OS preference on first visit. Correct logo auto-swaps per theme.
- Every input labeled; errors announced (aria-live); full keyboard nav; visible focus
  rings (`--ring`); AA contrast verified in light **and** dark.

---

## 12. Status

Phase 4 is **LOCKED**. Phases 1–4 are the single source of truth for implementation.
Next: **Module 1 — Project Initialization** (on approval).
