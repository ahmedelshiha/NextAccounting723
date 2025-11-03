# Production Log Audit — tax-hub.vercel.app-1761596140828.log

Time range observed: 2025-10-27T20:12:53.160Z → 2025-10-27T20:12:56.646Z
Scope: Parsed console/network/perf lines from docs/tax-hub.vercel.app-1761596140828.log

## Status Update
- P0-1 completed: Adjusted icon validation order and normalized/sanitized actions in PageHeader to eliminate false error logs for React elements and arrays.

## Summary
- Notable issues:
  - Repeated PageHeader prop validation errors (icons/actions)
  - Performance threshold breaches for apiResponseTime (up to ~3.49s)
  - Network failures: 500 at /api/admin/tasks/analytics, 403 at a stats resource
  - Third‑party iframe blocked by Tracking Prevention (non-actionable)

## Top Recurring Errors/Warnings
1) PageHeader: Invalid icon/action inputs (primaryAction/secondaryActions) with details:
   - “🚨 PageHeader.primaryAction.icon: React component object passed as icon”
   - “🚨 PageHeader: Invalid primaryAction: Array(1)”
   - “🚨 PageHeader.secondaryActions[i].icon: React component object passed as icon”
2) Performance alerts from usePerformanceMonitoring: apiResponseTime exceeded 1s, values > 2.5s, up to ~3.49s.
3) Network 500: GET /api/admin/tasks/analytics
4) Network 403: stats (likely /api/admin/*/stats) — permission/session required
5) Browser Tracking Prevention blocked safeframe.googlesyndication.com (benign)

## JavaScript/Validation Details
- Source: src/components/dashboard/PageHeader.tsx and src/utils/actionItemValidator.ts
- Symptoms:
  - Icons provided as JSX elements/object instead of component reference (e.g., <Plus /> rather than Plus)
  - primaryAction provided as an array in at least one usage
- Context: StandardPage sanitizes icons/array (src/components/dashboard/templates/StandardPage.tsx), but direct PageHeader usages or template consumers may still pass invalid shapes.

## Network Failures
- 500: /api/admin/tasks/analytics
  - Route: src/app/api/admin/tasks/analytics/route.ts
  - Potential causes: tenant context missing/invalid, Prisma query issues (complianceRecord joins/tenant scoping), env guard (hasDb) true but DB not reachable.
- 403: stats (exact URL not logged by browser console)
  - Likely admin stats endpoints (e.g., /api/admin/services/stats, /api/admin/stats/users, /api/admin/stats/clients)
  - Cause: missing auth/permission in session; client not handling 403 gracefully

## Performance Alerts
- Source: src/hooks/usePerformanceMonitoring.ts
- Metric: apiResponseTime threshold 1000ms
- Observed spikes: ~1.06s → 3.49s
- Current logging lacks endpoint attribution; only emits metric name/value/threshold.

## Non-Actionable/Informational
- Tracking Prevention blocked safeframe.googlesyndication.com — ignore or feature flag off any ad iframes.

## Immediate Recommendations (overview)
- Normalize all usages to pass icon as a component reference (not JSX element) and ensure primaryAction is an object.
- Ensure all pages use StandardPage or sanitize props before reaching PageHeader. Audit remaining direct PageHeader usage.
- Add endpoint attribution to performance logs (resource.entry.name) and aggregate slow endpoints.
- Stabilize /api/admin/tasks/analytics: improved error logging, validate Prisma relations, enforce tenant filters, and degrade client UX on 500.
- Handle 403s consistently: show fallback UI and retry post-login.

See docs/log-fix-plan.md for prioritized steps and docs/log-fixes-todo.md for atomic tasks.
