# Client Portal Upgrade — Phased Roadmap with Epics & Tickets

This roadmap maps planned capabilities to the existing Next.js/Prisma codebase. It references concrete files and scripts, aligns with the enterprise addendum, and is structured for import into Linear/Jira.

Repo audit (highlights)
- Framework: Next.js 15, React 19, Tailwind 4, Prisma/Postgres, Sentry, Upstash Redis. Key paths:
  - App shell: src/app/layout.tsx, src/components/providers/client-layout.tsx, src/components/ui/navigation.tsx
  - Landing content: src/app/page.tsx, src/components/home/hero-section.tsx, services-section.tsx, testimonials-section.tsx
  - Admin/menu system: src/lib/menu/defaultMenu.ts, src/stores/admin/*, src/components/admin/*
  - Tests/tooling: vitest, playwright, scripts/ci/*, semgrep rules
  - DB: prisma/schema.prisma with rich User, Tasks, Invoices, etc.

Conventions
- Use feature flags via NEXT_PUBLIC_* and server flags when landing risky features.
- RLS enforced in DB; add indices with migrations under prisma/migrations.
- All UI components accessible, RTL-ready, and localized (src/lib/i18n, locales/).

Recommended Architecture: Modular Component Structure
- Goals: smaller files (~100–150 LOC), independent testing, lazy loading, team parallelism, performance, maintainability, reusability.
- Foldering (example for Setup Wizard)
  - src/components/portal/business-setup/SetupWizard.tsx (shell)
  - src/components/portal/business-setup/tabs/{ExistingBusiness.tsx,NewStartup.tsx,Individual.tsx}
  - src/hooks/business-setup/{useSetupForm.ts,useLicenseLookup.ts}
  - src/lib/registries/{uae.ts,ksa.ts,egy.ts}
  - src/services/entities/entitySetup.ts (service layer)
  - src/app/api/entities/setup/route.ts and src/app/api/registries/[country]/[number]/route.ts
  - src/types/entitySetup.ts
- Patterns
  - next/dynamic + React.Suspense per tab; React.memo for pure views; ErrorBoundary per tab.
  - State isolation via Zustand store scoped to wizard; SWR per tab with cache keys; prefetch on tab focus.
  - Strict typing with zod schemas; idempotency keys for writes; audit events.
  - Accessibility: ARIA Tabs, roving tabindex, focus trap for dialogs; RTL mirroring.
- Testing
  - Unit tests for hooks/validators; component tests (Testing Library) for each tab; Playwright E2E flows; snapshot RTL.
- Performance
  - Code-split tabs, skeletons, defer non-critical requests; Sentry transactions around tab loads.

---

## Phase 0 — Foundations (Architecture, Security, Localization)
Epic: FND-0 Foundations hardening
- TCK-0.1 RBAC audit and roles consolidation
  - Add roles and SoD checks; tests in tests/integration/auth/*; scripts/check-required-envs.sh update for new flags.
- TCK-0.2 Country registry
  - New module at src/lib/settings/registry.ts for UAE/KSA/EGY obligations, calendars, validations; unit tests.
- TCK-0.3 i18n/RTL enablement
  - Ensure Arabic across layout.tsx, navigation.tsx; add ar.json/hi.json completions; RTL screenshots.
- TCK-0.4 Observability
  - Wire Sentry performance and error filters; dashboards in monitoring/; vitals reported in layout.tsx.
- Acceptance: RLS/RBAC tests pass; AR/EN toggles; Sentry shows no critical leaks.

## Phase 1 — Entities & People
Epic: ENT-1 Entity & People management
- TCK-1.1 Entity domain
  - prisma migration: entities, registrations, economic_zones; services at src/services/admin-settings.service.ts.
- TCK-1.2 People invitations & 2FA
  - Flows in src/app/register, src/app/login; 2FA toggles in UserProfile; tests.
- TCK-1.3 Search & bulk import
  - Server search endpoint; CSV importer with validation; UI in /admin.

### Phase 1.1 — Business Account Setup Wizard (Modal)
Epic: ENT-1.1 Setup wizard
- TCK-1.1a Modal UI (desktop/web)
  - New component src/components/portal/business-setup/SetupWizard.tsx; ARIA dialog; tabs Existing/New/Individual.
- TCK-1.1b Validators & adapters
  - src/lib/registries/* for UAE/KSA/EGY; GET /api/registries/:country/license/:number; unit tests.
- TCK-1.1c Setup API & consent
  - POST /api/entities/setup; POST /api/consents; audit events; idempotency.
- TCK-1.1d Mobile parity
  - Swipe-to-setup interaction; RTL mirrored gesture; e2e.

### Phase 1.1B — Business Verification
Epic: ENT-1.2 Verification job
- TCK-1.2a Queue job processor
  - Worker under src/lib/jobs/entity-setup.ts; Redis pub/sub updates; NOTIFY fallback.
- TCK-1.2b Pending/Success/Error screens
  - Pages and deep-link; telemetry events.

## Phase 2 — Dashboard & Actionables
Epic: DASH-2 Unified dashboard (mobile/desktop)
- TCK-2.1 Mobile Home screen
  - Header greeting + flag; verification banner; Upcoming Compliance widget; features grid (KYC, Documents, Invoicing, Upload Bill, Attendance, Approvals).
- TCK-2.2 Desktop layout
  - 12-col grid; left sidebar; command palette; same widgets and routes.
- TCK-2.3 Global search
  - Command palette (Cmd/Ctrl+K) searching entities, filings, docs; API + caching.

### Phase 2.1 — Upcoming Compliances (List & Detail)
Epic: COMP-2.1 Compliance list/detail
- TCK-2.1a Rules engine
  - src/lib/compliance/rules.ts; unit tests for VAT/ESR/UBO/WHT.
- TCK-2.1b API & grouping
  - GET /api/compliance/upcoming; PATCH /api/filing-periods/:id; ICS export.
- TCK-2.1c UI
  - Mobile month chips screen; desktop two-pane with filters; keyboard shortcuts.

### Phase 2.2 — Features Hub
Epic: HUB-2.2 Feature tiles
- KYC center, Documents quick access, Invoicing, Upload Bill (OCR), Approvals queue, Attendance optional.
- New routes under src/app/portal/* with guards; badges via counts APIs.

### Phase 2.3 — Services Directory
Epic: SRV-2.3 Service catalog
- services model + CRUD; search/typeahead; request flow opens Messaging case.

### Phase 2.4 — Profile & Account Center
Epic: PRF-2.4 Settings & profile
- Profile, Wallet, Cart, Documents, Feedback/Rating, Logout, About, Bug report, Support, Preferences, Security (2FA/biometric), Sessions.

## Phase 3 — Documents Vault
Epic: DOC-3 Vault
- Versioned documents, OCR, virus scan (clamav-service/), e-sign; immutable audit trails; link to tasks/returns.

## Phase 4 — Messaging & Support
Epic: MSG-4 Cases & chat
- Case-based threads tied to filings/tasks; SLA timers; KB and ticketing; live chat.

## Phase 5 — Payments & Billing
Epic: BILL-5 Billing & reconciliation
- Firm invoices, payment methods, refunds/dunning; government payment references; reconciliation to filings.

## Phase 6 — Connected Banking & Receipts
Epic: BNK-6 Banking & receipts OCR
- Bank aggregator connectors; CSV fallback; receipt inbox; auto-match pipeline.

## Phase 7 — Country Tax Workflows
Epics: UAE-7, KSA-7, EGY-7
- End-to-end VAT/Corporate/Zakat/WHT/ESR/ETA workflows; validations and working papers.

## Phase 8 — E‑Invoicing Integrations
Epics: ZATCA-8, ETA-8
- KSA Phase-2 adapters; Egypt clearance/signing; key rotation and tamper-proof storage.

## Phase 9 — AI Agents
Epic: AI-9 Assistants
- Intake assistant; doc classification; anomaly detection; human-in-the-loop and logging.

## Phase 10 — Teams & Permissions
Epic: TEAM-10 Collaboration
- Spaces, shared views, auditor links, redaction tools.

## Phase 11 — Accessibility, Internationalization, Mobile
Epic: A11Y-11 & I18N-11
- WCAG 2.2 AA; RTL layouts; mobile polish and print-friendly returns.

## Phase 12 — Analytics, SLAs, Reporting
Epic: ANL-12 Ops analytics & client reports
- Dashboards; alerts; scheduled exports.

## Phase 13 — Migration & Cutover
Epic: MIG-13 Data migration
- Import legacy entities/docs; backfill registrations; dual-run + rollback.

## Phase 14 — Security & Compliance
Epic: SEC-14 Hardening
- 2FA/step-up, IP allowlist, device approvals, encryption, retention policies, audit logs.

## Phase 15 — Go-Live & Stabilization
Epic: GL-15 Launch
- Canary cohorts, support playbook, NPS/CSAT instrumentation.

---

## Enterprise Addendum Roadmap (Oracle Fusion/SAP–inspired)
Epics: MDM-EN, BPM-EN, RULES-EN, INTEG-EN, DATA-EN, IAM-EN, GRC-EN, RESIL-EN, GLOBAL-EN, CHANGE-EN, TEST-EN
- MDM-EN Master Data
  - TKT: party/product/taxcode schemas; survivorship rules; dedupe service; merge/unmerge logs.
- BPM-EN Workflow/Approvals
  - TKT: policy DSL; matrix UI; escalations; delegation; vacation rules; audit bundle.
- RULES-EN Policy Engine
  - TKT: decision tables; simulator UI; versioning/rollback; evaluation traces.
- INTEG-EN Integration Hub
  - TKT: connectors, DLQ/replay, metrics, circuit breakers, quotas; correlation IDs.
- DATA-EN Data Platform
  - TKT: warehouse schemas; ETL jobs; BI dashboards; masking in exports.
- IAM-EN SSO/SCIM/ABAC
  - TKT: OIDC/SAML; SCIM provisioning; SoD checkers; device posture.
- GRC-EN Records/Retention
  - TKT: retention schedules, legal holds, e-discovery, hash-chained logs.
- RESIL-EN Resilience/SLOs
  - TKT: PITR, failover drills, graceful degradation, kill switches.
- GLOBAL-EN Globalization
  - TKT: multi-currency FX rates; fiscal calendars; locale/date/dir; weekends.
- CHANGE-EN Release Mgmt
  - TKT: env gates, CAB logs, canaries, migration playbooks.
- TEST-EN Testing Strategy
  - TKT: contract tests; synthetic monitoring; load/soak; chaos drills.

---

## Milestones & Suggested Order
- M0: Phase 0
- M1: Phases 1 + 1.1 + 1.1B
- M2: Phase 2 + 2.1–2.4
- M3: Phase 3–5
- M4: Phase 6–8
- M5: Phase 9–12
- M6: Phase 13–15 and selected Enterprise epics (MDM, BPM, RULES)

## Import tips (Linear/Jira)
- Use epic key prefixes above; create issue templates for “API”, “UI”, “Migration”, “Tests”.
- Add labels: country:uae|ksa|egy, surface:mobile|desktop, type:api|ui|job|migration, risk:high|med|low.
- Definition of Done: tests pass, a11y checked, i18n complete, Sentry clean, docs updated.
