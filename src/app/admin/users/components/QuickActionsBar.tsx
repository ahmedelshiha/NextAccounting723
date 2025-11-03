'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface QuickActionsBarProps {
  onAddUser?: () => void
  onImport?: () => void
  onBulkOperation?: () => void
  onExport?: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

/**
 * Quick Actions Bar for operations dashboard
 * 
 * Provides fast access to common user management operations:
 * - Add User (trigger onboarding workflow)
 * - Import CSV (bulk import users)
 * - Bulk Update (trigger bulk operations wizard)
 * - Export (download user list)
 * - Refresh (reload data)
 * 
 * Features:
 * - Responsive button layout
 * - Loading state support
 * - Accessibility-compliant
 * - Icon-based visual communication
 */
export function QuickActionsBar({
  onAddUser,
  onImport,
  onBulkOperation,
  onExport,
  onRefresh,
  isLoading = false
}: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-200">
      <Button
        onClick={onAddUser}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700"
        size="sm"
      >
        <span className="mr-2">➕</span>
        Add User
      </Button>

      <Button
        onClick={onImport}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        <span className="mr-2">📥</span>
        Import CSV
      </Button>

      <Button
        onClick={onBulkOperation}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        <span className="mr-2">⚙️</span>
        Bulk Update
      </Button>

      <Button
        onClick={onExport}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        <span className="mr-2">📤</span>
        Export
      </Button>

      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        <span className="mr-2">🔄</span>
        Refresh
      </Button>
    </div>
  )
}
