/**
 * Admin Feature Flags
 *
 * Centralized feature flag management for admin dashboard features.
 * NOTE: AdminWorkBench is now permanently enabled in production.
 * Legacy feature flag code retained for backward compatibility.
 */

/**
 * Check if AdminWorkBench (new dashboard UI) is enabled
 *
 * ✅ ALWAYS RETURNS TRUE - AdminWorkBench is the default UI
 * No environment variables are needed.
 *
 * @returns true - AdminWorkBench is always enabled
 */
export const isAdminWorkBenchEnabled = (): boolean => {
  // AdminWorkBench is now the default and only dashboard UI
  return true
}

/**
 * Check if AdminWorkBench is enabled for a specific user
 *
 * ✅ ALWAYS RETURNS TRUE - AdminWorkBench is enabled for all users
 * No environment variables or rollout checks are needed.
 *
 * @param userId - The user ID (unused, kept for backward compatibility)
 * @param userRole - The user's role (unused, kept for backward compatibility)
 * @returns true - AdminWorkBench is enabled for all users
 */
export const isAdminWorkBenchEnabledForUser = (userId: string, userRole?: string): boolean => {
  // AdminWorkBench is now enabled for all users
  return true
}

/**
 * Get AdminWorkBench feature flag configuration
 *
 * Returns metadata about the feature flag status with configurable rollout
 */
export const getAdminWorkBenchFeatureFlagConfig = () => {
  // Get rollout percentage from environment, default to 100%
  const rolloutPercentage = getEnvironmentVariable(
    'NEXT_PUBLIC_ADMIN_WORKBENCH_ROLLOUT_PERCENTAGE',
    '100'
  )
  const targetUsersEnv = getEnvironmentVariable(
    'NEXT_PUBLIC_ADMIN_WORKBENCH_TARGET_USERS',
    'all'
  )
  const betaTesters = getBetaTesterList()

  return {
    enabled: isAdminWorkBenchEnabled(),
    rolloutPercentage: parseInt(rolloutPercentage, 10),
    targetUsers: parseTargetUsers(targetUsersEnv),
    betaTesters,
    description: 'New AdminWorkBench UI for user management dashboard',
  }
}

/**
 * Get environment variable with fallback
 */
function getEnvironmentVariable(key: string, defaultValue: string): string {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key] as string
  }

  if (typeof window !== 'undefined') {
    const envValue = (window as any).__ENV__?.[key]
    if (envValue !== undefined) {
      return envValue
    }
  }

  return defaultValue
}

/**
 * Parse target users configuration
 * Supports: 'all', 'admins', 'beta', or comma-separated role list
 */
function parseTargetUsers(targetUsersStr: string): string | string[] {
  if (targetUsersStr === 'all' || targetUsersStr === 'beta') {
    return targetUsersStr
  }

  if (targetUsersStr === 'admins') {
    return ['ADMIN']
  }

  // Support comma-separated list of roles
  if (targetUsersStr.includes(',')) {
    return targetUsersStr.split(',').map((role) => role.trim().toUpperCase())
  }

  // Single role
  if (targetUsersStr && targetUsersStr !== 'all') {
    return [targetUsersStr.toUpperCase()]
  }

  return 'all'
}

/**
 * Get list of beta tester user IDs from environment
 */
function getBetaTesterList(): string[] {
  const betaListEnv = getEnvironmentVariable('NEXT_PUBLIC_ADMIN_WORKBENCH_BETA_TESTERS', '')
  if (!betaListEnv) {
    return []
  }

  return betaListEnv.split(',').map((id) => id.trim()).filter(Boolean)
}
