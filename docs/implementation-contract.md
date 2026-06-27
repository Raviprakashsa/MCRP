# Implementation Contract (LOCKED)

**Applies to:** every module / remaining phase of MCRP.
**Status:** Binding. Phases 1–4 are LOCKED and are the single source of truth.
**Last updated:** 2026-06-27

This contract governs how all code is produced. If any instruction conflicts with an
approved decision in `docs/phase-1..4`, I stop and ask before proceeding.

## The 12 rules
1. **Never change approved decisions** (architecture, DB schema, UI/UX, design system,
   auth, folder structure, naming conventions, tech stack) without explicit approval.
2. **Production quality only** — no demo/sample/placeholder code, no `TODO`s, no fake
   data (unless requested), no temporary workarounds.
3. **Build like a senior engineer** — update existing files over creating new ones;
   no duplicate utilities; reuse components; keep modular.
4. **Explain every major decision** — libraries, packages, deps, folders, DB design,
   auth approach: briefly justify over alternatives.
5. **Minimal dependencies** — install only with significant value; prefer official /
   simplest well-maintained option.
6. **Verify before continuing** — after each module: self-review, TypeScript check,
   lint check, security check, performance check. Report issues first.
7. **Documentation per module** — what was built, why, folder changes, env changes,
   DB changes, commands executed, manual testing checklist.
8. **Git workflow** — after each module: recommended commit message, what changed,
   breaking changes (if any).
9. **UI consistency** — never introduce a color/spacing/typography/radius/shadow/
   component style outside the approved design system (Phase 4).
10. **Performance & security** — accessibility, SEO (where applicable), performance,
    security, responsive design are mandatory, not optional.
11. **Think before coding** — review prior phases, check deps/compatibility, identify
    edge cases, then implement.
12. **Completion rule** — a module is complete only when all code is implemented, no
    placeholders remain, docs are complete, the testing checklist is done, and it's
    production-deployable. Only then wait for approval before the next module.

## Module sequence (each gated by approval)
1. Project Initialization · 2. Supabase Setup · 3. Database · 4. Authentication ·
5. Candidate Registration Wizard · 6. Candidate Dashboard · 7. Admin Dashboard ·
8. Deployment.

## Milestone grouping (approved 2026-06-27)
- **Milestone 1 — Project setup + Supabase + Database** → Modules 1, 2, 3
- **Milestone 2 — Authentication + Candidate Registration** → Modules 4, 5
- **Milestone 3 — Candidate Dashboard + Profile** → Module 6
- **Milestone 4 — Admin Panel + Search + Export** → Module 7
- **Milestone 5 — Deployment + Testing + Documentation** → Module 8

Within each milestone I complete one module, run the Rule 6 self-review, and pause for
approval before the next module (modules stay individually gated; milestones are the
high-level grouping).
