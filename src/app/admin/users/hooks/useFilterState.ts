'use client'

import { useState, useCallback, useMemo } from 'react'
import { UserItem } from '../contexts/UserDataContext'
import { useFilterUsers } from './useFilterUsers'

export interface FilterState {
  search: string
  roles: string[]      // Multi-select: array of roles
  statuses: string[]   // Multi-select: array of statuses
  // Legacy single-select support (deprecated)
  role?: string | null
  status?: string | null
}

export interface FilterStats {
  totalCount: number
  filteredCount: number
  isFiltered: boolean
}

export function useFilterState(users: UserItem[]) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    roles: [],
    statuses: []
  })

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, [])

  // Memoized filtered results using existing useFilterUsers hook
  const filteredUsers = useMemo(() => {
    let result = users

    // Apply search filter using the existing hook for consistency
    if (filters.search) {
      const searchOptions = {
        search: filters.search,
        role: undefined,
        status: undefined
      }
      result = useFilterUsers(result, searchOptions, {
        searchFields: ['name', 'email', 'phone'],
        caseInsensitive: true,
        sortByDate: false,  // Don't sort yet, we'll sort at the end
        serverSide: false
      }) as UserItem[]
    }

    // Apply multi-select role filter (OR logic: match any selected role)
    if (filters.roles.length > 0) {
      result = result.filter(user => filters.roles.includes(user.role))
    }

    // Apply multi-select status filter (OR logic: match any selected status)
    if (filters.statuses.length > 0) {
      result = result.filter(user => {
        const userStatus = user.status || 'ACTIVE'
        return filters.statuses.includes(userStatus)
      })
    }

    // Sort by creation date
    result = result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return result
  }, [users, filters])

  const hasActiveFilters = !!(
    filters.search ||
    filters.roles.length > 0 ||
    filters.statuses.length > 0
  )

  const clearFilters = useCallback(() => {
    setFilters({ search: '', roles: [], statuses: [] })
  }, [])

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const stats: FilterStats = {
    totalCount: users.length,
    filteredCount: filteredUsers.length,
    isFiltered: hasActiveFilters
  }

  // Helper functions for multi-select operations
  const toggleRole = useCallback((role: string) => {
    setFilters(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }, [])

  const toggleStatus = useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }, [])

  const clearRoles = useCallback(() => {
    setFilters(prev => ({ ...prev, roles: [] }))
  }, [])

  const clearStatuses = useCallback(() => {
    setFilters(prev => ({ ...prev, statuses: [] }))
  }, [])

  return {
    filters,
    setFilters,
    updateFilter,
    filteredUsers,
    hasActiveFilters,
    clearFilters,
    // Multi-select helpers
    toggleRole,
    toggleStatus,
    clearRoles,
    clearStatuses,
    stats
  }
}
