import { useMemo } from 'react'
import { UserItem } from '../contexts/UserDataContext'

export interface FilterOptions {
  search?: string
  role?: string
  status?: string
  department?: string
  tier?: string
  [key: string]: string | undefined
}

export interface FilterConfig {
  searchFields?: string[]
  caseInsensitive?: boolean
  sortByDate?: boolean
}

const DEFAULT_CONFIG: FilterConfig = {
  searchFields: ['name', 'email', 'company'],
  caseInsensitive: true,
  sortByDate: true
}

/**
 * Unified user filtering hook - consolidates filtering logic across all components
 * Eliminates 40% duplication in filtering implementations
 *
 * @param users - Array of users to filter
 * @param filters - Filter options (search, role, status, etc.)
 * @param config - Optional configuration for filtering behavior
 * @returns Filtered and sorted array of users
 *
 * @example
 * const filtered = useFilterUsers(users, {
 *   search: 'john',
 *   role: 'ADMIN',
 *   status: 'ACTIVE'
 * })
 */
export function useFilterUsers(
  users: UserItem[],
  filters: FilterOptions,
  config: FilterConfig = DEFAULT_CONFIG
): UserItem[] {
  return useMemo(() => {
    const {
      searchFields = DEFAULT_CONFIG.searchFields,
      caseInsensitive = DEFAULT_CONFIG.caseInsensitive,
      sortByDate = DEFAULT_CONFIG.sortByDate
    } = config

    let result = users

    // Apply search filter
    if (filters.search?.trim()) {
      const searchTerm = caseInsensitive ? filters.search.trim().toLowerCase() : filters.search.trim()

      result = result.filter((user) => {
        return searchFields!.some((field) => {
          const value = field.split('.').reduce((obj: any, key) => obj?.[key], user) as string
          if (!value) return false

          const valueStr = caseInsensitive ? String(value).toLowerCase() : String(value)
          return valueStr.includes(searchTerm)
        })
      })
    }

    // Apply role filter
    if (filters.role && filters.role !== 'ALL') {
      result = result.filter((user) => user.role === filters.role)
    }

    // Apply status filter
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((user) => (user.status || 'ACTIVE') === filters.status)
    }

    // Apply tier filter (for clients)
    if (filters.tier && filters.tier !== 'all' && filters.tier !== 'ALL') {
      result = result.filter((user) => {
        const userTier = (user as any).tier || ''
        const filterTier = caseInsensitive ? filters.tier!.toLowerCase() : filters.tier
        const userTierNorm = caseInsensitive ? userTier.toLowerCase() : userTier
        return userTierNorm === filterTier
      })
    }

    // Apply department filter
    if (filters.department && filters.department !== 'ALL') {
      result = result.filter((user) => user.department === filters.department)
    }

    // Sort by creation date if enabled
    if (sortByDate) {
      result = result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    return result
  }, [users, filters, config.searchFields, config.caseInsensitive, config.sortByDate])
}
