# Admin Dashboard: Dark Mode Migration & Hard-coded Color Audit

## Summary
A practical, staged plan to fully migrate the Admin UI to use semantic theme tokens (bg-card, bg-background, bg-muted, border-border, text-foreground, text-muted-foreground) and remove hard-coded light-only classes so dark mode applies consistently across admin pages.

## Objectives
- Replace hard-coded color utilities with semantic tokens across the admin codebase.
- Keep visual parity in light mode and ensure correct contrast in dark mode.
- Minimize regressions and preserve component behavior and accessibility.
- Provide automated codemod scripts and a manual review step for edge cases.

## Scope
- All files under `src/components/admin/**` and admin-specific pages/layouts.
- Related providers and skeletons (layouts, providers, error boundaries, skeletons).
- Exclude public marketing pages unless they share admin components.

## Non-Goals
- Rewriting component visuals or UX changes other than color tokens.
- Replacing third-party library markup unless necessary for theming.

## Timeline & Phases
- Phase 0 — Discovery & Inventory (1 day)
  - Run grep to list uses of hard-coded classes: bg-white, bg-gray-*, text-gray-*, border-gray-*.
  - Create a prioritized list of files by frequency and visual importance.

- Phase 1 — Automated Tokenization (1–2 days)
  - Apply safe automated replacements (codemod/perl) for common patterns.
  - Patterns: bg-white→bg-card, bg-gray-50→bg-background, bg-gray-100/200/300→bg-muted, text-gray-900→text-foreground, text-gray-(8|7|6|5|4)00→text-muted-foreground, border-gray-200→border-border, divide-gray-100→divide-border.
  - Commit in small batches (per-area commits).

- Phase 2 — Manual Review & Edge Fixes (1–2 days)
  - Manually inspect cards, modals, charts, badges, and status indicators.
  - Ensure status colors (green/yellow/red) keep original palettes for meaning.
  - Adjust chart colors, SVG fills, and 3rd-party widgets as needed.

- Phase 3 — Testing & QA (1 day)
  - Run unit, integration, and E2E tests.
  - Manual visual QA across key admin pages (Overview, Analytics, Settings, Service Requests, Booking Settings, Team Management, Profile panels).
  - Accessibility check: color contrast, focus rings, live regions.

- Phase 4 — Pre-Release & Rollout (half day)
  - Open a draft PR with clear changes and screenshots for reviewers.
  - Stage deploy to preview env and run smoke tests.

- Phase 5 — Monitoring & Rollback (1 day)
  - Monitor Sentry/errors and user feedback.
  - If regressions found, revert by PR or hotfix specific files.

## Tasks (detailed)
1. Discovery
   - grep "bg-white|text-gray-|border-gray-|bg-gray-" - list files and count occurrences.
   - Produce inventory (CSV or table) grouped by component priority.
2. Codemod script
   - Create a small codemod (node/perl) that replaces safe patterns.
   - Run locally against feature branch in small batches.
3. Token replacement
   - Replace general background/text/border classes.
   - Preserve semantic status and accent colors (blue/green/red/yellow) unchanged unless they need dark variants.
4. Manual fixes
   - Modals: ensure backdrop, content, and buttons use tokens.
   - Charts: map palettes to dark-friendly variants; update chart config if needed.
   - Third-party widgets: add dark wrappers or CSS overrides.
5. Tests
   - Run `pnpm test` (or npm test) and fix any failing snapshots or tests.
   - Run E2E smoke for admin flows (login → dashboard → settings → bookings).
6. Visual QA
   - Use the preview URL to inspect pages in light and dark (toggle ThemeSelector in header).
   - Capture screenshots of critical pages and compare.
7. PR & Review
   - Create small, focused PRs grouped by area and include screenshots.
   - Ask at least one reviewer to check visuals and accessibility.
8. Release
   - Merge to `stellar-home` (or target branch), deploy preview then production after sign-off.
9. Post-release
   - Monitor errors and collect user feedback for one week.

## Files / Areas to prioritize
- Layouts: `src/app/layout.tsx`, `src/app/admin/layout.tsx`, `src/components/admin/layout/*`
- Header & Sidebar: `AdminHeader.tsx`, `AdminSidebar.tsx`, `SidebarHeader.tsx`, `SidebarFooter.tsx`
- User menu and avatar: `UserProfileDropdown` and `Avatar`
- Panels & Cards: `AnalyticsDashboard`, `PerformanceMetricsCard`, `RealtimeMetrics`, `SystemHealthPanel`
- Tables & Lists: `service-requests/*`, `currency-manager.tsx`, `BookingsList`.
- Settings & Forms: `settings/**` (shells, cards, modals)
- Skeletons & Providers: `AdminDashboardLayoutLazy`, `AdminProviders`, `ClientOnlyAdminLayout`

## PR checklist
- [ ] Changes split into logical PRs (≤ 200LOC each where possible)
- [ ] Screenshots for light and dark for each PR
- [ ] Unit & E2E tests pass
- [ ] Accessibility checks: contrast + keyboard nav
- [ ] No console warnings or errors
- [ ] Reviewer sign-off (visual + accessibility)

## Risks & Mitigations
- Risk: Visual regressions or contrast issues. Mitigation: manual QA and include designers/dev reviewers.
- Risk: Over-replacing semantic colors. Mitigation: use targeted patterns and exclude known accent classes.
- Risk: Snapshot/test failures. Mitigation: update snapshots only when visuals intentionally changed and note them in PR.

## Automation & Scripts
- codemod/tokenize.js — script that accepts patterns and runs replacements safely (dry-run mode first).
- visual-regression.sh — script to take screenshots of key routes in both themes.
- testing workflow — CI job that runs tests and visual checks on PR.

## Owners & Roles
- Author: frontend engineer (you)
- Reviewer: frontend peer + accessibility reviewer
- QA: product or QA engineer for visual sign-off
- DevOps: for preview deploy and monitoring setup

## Acceptance Criteria
- Admin UI consistently applies dark mode across all major pages
- No functionality regressions or breaking accessibility
- Changes reviewed and merged with PRs and screenshots

## Follow-ups (optional)
- Convert CSS tokens into a design tokens JSON for cross-platform use
- Add e2e visual snapshots (Percy or Playwright snapshot) in CI

---
Generated plan: docs/admin-dark-mode-migration-plan.md

