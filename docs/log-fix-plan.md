# Log Fix Plan (Prioritized)

## Status
- P0-1 (PageHeader validation noise) — Completed: validator ordering fixed; PageHeader now normalizes arrays and sanitizes icons.

## P0 — Breakage and High Noise
1) PageHeader prop/validation errors (High noise, risk of React error #31)
   - Owner: Frontend
   - Why: Floods console, obscures real errors; potential runtime risks.
   - Plan:
     - Enforce icon as component reference everywhere. Replace any JSX element icon usage with symbol references (e.g., Plus, Download).
     - Ensure primaryAction is an object, not an array.
     - Prefer StandardPage container (it sanitizes icons/arrays) over direct PageHeader usage; refactor direct usages where feasible.
     - Adjust validator to treat React elements as warnings (not errors) OR keep strict but rely on sanitization upstream. Choose one policy and be consistent.
   - Verification:
     - Reload admin pages; console shows zero “🚨 PageHeader …” messages.
     - Add unit test for validateIcon/validateActionItem expected behavior (src/utils/actionItemValidator.ts).

2) /api/admin/tasks/analytics returns 500
   - Owner: Backend
   - Likely causes:
     - Tenant context missing; Prisma joins not tenant-scoped; relation names mismatch; DB connectivity hiccup.
   - Plan:
     - Add structured error logs and return problem details in dev.
     - Validate all Prisma calls exist in schema and include tenantFilter where required.
     - Guard when hasDb=false and ensure fallback payload matches client expectations.
     - Add e2e test to assert 200 + shape under seeded data.
   - Verification:
     - Manual GET returns 200 with fields: total, completed, byStatus, byPriority, avgAgeDays, compliance{…}, dailyTotals, dailyCompleted.
     - Playwright e2e on admin tasks passes.

## P1 — Performance Reliability
3) API response time spikes (>1s up to ~3.49s)
   - Owner: Frontend+Backend
   - Plan (observability first):
     - Enhance usePerformanceMonitoring to include the resource entry name (URL) when threshold breached; bucket per-path.
     - Add client sampling (e.g., 1/10 sessions) to avoid log noise.
     - On server, add timing headers and log slow queries (Prisma.$on('query')).
   - Plan (remediation):
     - Add caching to read-heavy endpoints (lib/api-cache.ts keys) and memoize expensive computations.
     - Optimize prisma groupBy/aggregate queries used by analytics endpoints.
   - Verification:
     - After deployment, perf logs include endpoint names and p95 < 1000ms for targeted routes.

4) 403 on stats endpoint(s)
   - Owner: Frontend
   - Plan:
     - Ensure admin pages fetch with proper session; use apiFetch wrapper.
     - Handle 401/403 in UI with a fallback card + sign-in CTA; avoid console errors.
   - Verification:
     - Unauthed session shows graceful fallback; authed shows data without 403s.

## P2 — Hygiene
5) Third‑party iframe blocked (safeframe)
   - Owner: Frontend/Marketing
   - Plan: Confirm we intend to load ads; otherwise remove/feature-flag.
   - Verification: No more blocked resource warnings.

## Rollout & Safety
- Ship in small PRs: (a) PageHeader refactor, (b) analytics API hardening, (c) perf observability, (d) 403 handling, (e) hygiene.
- Add tests for PageHeader validations, analytics API 200 path, and apiFetch 401/403 handling.
- Monitor Sentry (NEXT_PUBLIC_SENTRY_DSN present) for regressions.
