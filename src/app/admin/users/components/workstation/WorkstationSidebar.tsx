'use client'

import { memo, useCallback, useMemo } from 'react'
import { X } from 'lucide-react'
import type { WorkstationSidebarProps } from '../../types/workstation'
import { SavedViewsButtons } from './SavedViewsButtons'
import { AdvancedUserFilters, type UserFilters as AUserFilters } from '../AdvancedUserFilters'
import './workstation.css'

export const WorkstationSidebar = memo(function WorkstationSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  stats,
  onAddUser,
  onReset,
}: WorkstationSidebarProps) {
  // Helper to safely extract string filter values
  const getFilterValue = (value: any): string | undefined => {
    return typeof value === 'string' ? value : undefined
  }

  const handleViewChange = useCallback((viewName: string, roleFilter?: string) => {
    if (onFiltersChange) {
      onFiltersChange({
        search: '',
        role: roleFilter || undefined,
        status: undefined,
        department: undefined,
        dateRange: 'all',
      } as any)
    }
  }, [onFiltersChange])

  const handleResetClick = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange({})
    }
    if (onReset) {
      onReset()
    }
  }, [onFiltersChange, onReset])

  // Map filters from WorkstationIntegrated format to AdvancedUserFilters format
  const mappedFilters: AUserFilters = useMemo(() => ({
    search: getFilterValue((filters as any)?.search) || '',
    role: getFilterValue((filters as any)?.role),
    status: getFilterValue((filters as any)?.status),
    department: getFilterValue((filters as any)?.department),
    dateRange: getFilterValue((filters as any)?.dateRange),
  }), [filters])

  return (
    <div className="workstation-sidebar-content">
      {/* Close Button - Mobile Only */}
      <button
        className="sidebar-close-btn md:hidden"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X size={20} />
      </button>

      {/* Quick Stats Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Stats</h3>
        <div className="sidebar-stats-container">
          {stats && (
            <>
              <div className="stat-item">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{(stats as any).total || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active</span>
                <span className="stat-value">{((stats as any).clients || 0) + ((stats as any).staff || 0) + ((stats as any).admins || 0) || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value">0</span>
              </div>
            </>
          )}
          {!stats && (
            <div className="stat-item">
              <span className="stat-label">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Saved Views Section */}
      <SavedViewsButtons
        activeView="all"
        onViewChange={handleViewChange}
        viewCounts={{
          all: (stats as any)?.total || 0,
          clients: (stats as any)?.clients || 0,
          team: ((stats as any)?.staff || 0) + ((stats as any)?.admins || 0),
          admins: (stats as any)?.admins || 0,
        }}
        className="sidebar-saved-views"
      />

      {/* Filters Section - Scrollable */}
      <div className="sidebar-section sidebar-filters flex-1 overflow-y-auto">
        <h3 className="sidebar-title">Filters</h3>
        <div className="sidebar-filters-container">
          <AdvancedUserFilters
            filters={mappedFilters}
            onFiltersChange={(f) => onFiltersChange?.(f as any)}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Footer - Reset Button */}
      <div className="sidebar-footer">
        <button
          className="sidebar-reset-btn"
          onClick={handleResetClick}
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
})
