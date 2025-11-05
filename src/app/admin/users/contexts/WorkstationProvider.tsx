'use client'

import { useState, useCallback, ReactNode, useEffect } from 'react'
import { WorkstationContext } from './WorkstationContext'
import type { WorkstationContextType, QuickStatsData, UserFilters } from '../types/workstation'

interface WorkstationProviderProps {
  children: ReactNode
}

const defaultQuickStats: QuickStatsData = {
  totalUsers: 0,
  activeUsers: 0,
  pendingApprovals: 0,
  inProgressWorkflows: 0,
  refreshedAt: new Date(),
}

export function WorkstationProvider({ children }: WorkstationProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({ search: '' })
  const [quickStats, setQuickStats] = useState<QuickStatsData>(defaultQuickStats)
  const [quickStatsRefreshing, setQuickStatsRefreshing] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [bulkActionType, setBulkActionType] = useState('')
  const [bulkActionValue, setBulkActionValue] = useState('')
  const [isApplyingBulkAction, setIsApplyingBulkAction] = useState(false)

  // Load state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('workstation-layout-prefs')
      if (stored) {
        const prefs = JSON.parse(stored)
        if (typeof prefs.sidebarOpen === 'boolean') setSidebarOpen(prefs.sidebarOpen)
        if (typeof prefs.insightsPanelOpen === 'boolean') setInsightsPanelOpen(prefs.insightsPanelOpen)
      }
    } catch (e) {
      console.warn('Failed to load workstation preferences:', e)
    }
  }, [])

  // Save layout preferences to localStorage
  const handleSetSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpen(open)
    try {
      const current = JSON.parse(localStorage.getItem('workstation-layout-prefs') || '{}')
      localStorage.setItem('workstation-layout-prefs', JSON.stringify({
        ...current,
        sidebarOpen: open,
      }))
    } catch (e) {
      console.warn('Failed to save workstation preferences:', e)
    }
  }, [])

  const handleSetInsightsPanelOpen = useCallback((open: boolean) => {
    setInsightsPanelOpen(open)
    try {
      const current = JSON.parse(localStorage.getItem('workstation-layout-prefs') || '{}')
      localStorage.setItem('workstation-layout-prefs', JSON.stringify({
        ...current,
        insightsPanelOpen: open,
      }))
    } catch (e) {
      console.warn('Failed to save workstation preferences:', e)
    }
  }, [])

  /**
   * Refresh quick stats from API (Deferred to Phase 2.8 or Phase 3)
   * TODO: Implement API call to fetch:
   *   - totalUsers: Total user count
   *   - activeUsers: Currently active user count
   *   - pendingApprovals: Users awaiting approval
   *   - inProgressWorkflows: Active workflows
   * Expected endpoint: GET /api/admin/dashboard/quick-stats
   * Dependencies: Needs filter context to apply user filters (optional)
   */
  const refreshQuickStats = useCallback(async () => {
    setQuickStatsRefreshing(true)
    try {
      // TODO: Replace with actual API call to fetch quick stats
      // const response = await fetch('/api/admin/dashboard/quick-stats')
      // const data = await response.json()
      // setQuickStats(data)

      setQuickStats({
        ...defaultQuickStats,
        refreshedAt: new Date(),
      })
    } catch (error) {
      console.error('Failed to refresh quick stats:', error)
    } finally {
      setQuickStatsRefreshing(false)
    }
  }, [])

  /**
   * Apply bulk action to selected users
   * TODO: Implement API call to execute bulk operations (Deferred to Phase 3)
   * Supported bulk actions:
   *   - 'changeRole': Assign new role (value: roleId)
   *   - 'changeStatus': Update user status (value: status)
   *   - 'assignDepartment': Move to department (value: departmentId)
   *   - 'removeUsers': Deactivate/remove users
   *   - 'reassignTasks': Reassign user's tasks (value: newOwnerId)
   * Expected endpoint: POST /api/admin/users/bulk-actions
   */
  const applyBulkAction = useCallback(async () => {
    if (!bulkActionType || selectedUserIds.size === 0) {
      console.warn('Bulk action requires action type and selected users')
      return
    }

    setIsApplyingBulkAction(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/users/bulk-actions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     action: bulkActionType,
      //     value: bulkActionValue,
      //     userIds: Array.from(selectedUserIds),
      //   }),
      // })
      // const result = await response.json()

      if (process.env.WORKSTATION_LOGGING_ENABLED === 'true') {
        console.log('Applying bulk action:', {
          action: bulkActionType,
          value: bulkActionValue,
          users: Array.from(selectedUserIds),
        })
      }
    } catch (error) {
      console.error('Failed to apply bulk action:', error)
    } finally {
      setIsApplyingBulkAction(false)
    }
  }, [bulkActionType, bulkActionValue, selectedUserIds])

  const value: WorkstationContextType = {
    sidebarOpen,
    insightsPanelOpen,
    setSidebarOpen: handleSetSidebarOpen,
    setInsightsPanelOpen: handleSetInsightsPanelOpen,
    filters,
    setFilters,
    quickStats,
    quickStatsRefreshing,
    refreshQuickStats,
    selectedUserIds,
    setSelectedUserIds,
    bulkActionType,
    setBulkActionType,
    bulkActionValue,
    setBulkActionValue,
    applyBulkAction,
    isApplyingBulkAction,
  }

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  )
}
