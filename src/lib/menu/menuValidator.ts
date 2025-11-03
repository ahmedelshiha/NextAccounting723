/**
 * Menu Customization Validation Utility
 *
 * Validates incoming menu customization data to prevent corrupted or malicious data
 * from being saved to the database.
 */

import { MenuCustomizationData, PracticeItem, Bookmark } from '@/types/admin/menuCustomization'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valid section IDs that can be customized
 */
const VALID_SECTION_IDS = new Set([
  'dashboard',
  'business',
  'financial',
  'operations',
  'system',
])

/**
 * Valid menu item path patterns (admin routes)
 */
const VALID_ITEM_PATHS = new Set([
  'admin/analytics',
  'admin/audits',
  'admin/availability',
  'admin/bookings',
  'admin/calendar',
  'admin/chat',
  'admin/clients',
  'admin/compliance',
  'admin/cron-telemetry',
  'admin/expenses',
  'admin/integrations',
  'admin/invoices',
  'admin/newsletter',
  'admin/notifications',
  'admin/payments',
  'admin/perf-metrics',
  'admin/permissions',
  'admin/posts',
  'admin/profile',
  'admin/reminders',
  'admin/reports',
  'admin/roles',
  'admin/security',
  'admin/service-requests',
  'admin/services',
  'admin/settings',
  'admin/shortcuts',
  'admin/tasks',
  'admin/taxes',
  'admin/team',
  'admin/translations',
  'admin/uploads',
  'admin/users',
])

/**
 * Valid Lucide icon names (subset of common admin icons)
 */
const VALID_ICONS = new Set([
  'LayoutDashboard',
  'TrendingUp',
  'FileText',
  'Shield',
  'Settings',
  'Users',
  'Briefcase',
  'DollarSign',
  'Receipt',
  'BarChart3',
  'Zap',
  'Mail',
  'Bell',
  'Calendar',
  'Clock',
  'CheckCircle',
  'AlertCircle',
  'Info',
  'Lock',
  'Eye',
  'EyeOff',
  'Trash2',
  'Edit',
  'Plus',
  'Minus',
  'X',
  'Menu',
  'Search',
  'Filter',
  'Download',
  'Upload',
  'Copy',
  'Share2',
  'ExternalLink',
  'ChevronRight',
  'ChevronDown',
  'GripVertical',
  'MoreVertical',
  'Terminal',
])

/**
 * Validates a URL/href to ensure it's a safe internal path
 */
const isValidHref = (href: string): boolean => {
  if (!href || typeof href !== 'string') return false
  if (href.length > 500) return false

  // Only allow relative paths starting with /
  if (!href.startsWith('/')) return false

  // Prevent protocol-based injection
  if (href.includes('://') || href.includes('\\')) return false

  return true
}

/**
 * Validates a single section order entry
 */
const isValidSectionId = (id: string): boolean => {
  return typeof id === 'string' && VALID_SECTION_IDS.has(id)
}

/**
 * Validates a single hidden item path
 */
const isValidHiddenItemPath = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false
  if (path.length > 200) return false

  // Check if path is valid
  return VALID_ITEM_PATHS.has(path) || path.startsWith('admin/')
}

/**
 * Validates a practice item
 */
const isValidPracticeItem = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false

  const { id, name, icon, href, order, visible } = item

  if (!id || typeof id !== 'string' || id.length > 100) return false
  if (!name || typeof name !== 'string' || name.length > 100) return false
  if (!icon || typeof icon !== 'string' || !VALID_ICONS.has(icon)) return false
  if (!isValidHref(href)) return false
  if (typeof order !== 'number' || order < 0 || !Number.isInteger(order)) return false
  if (typeof visible !== 'boolean') return false

  return true
}

/**
 * Validates a bookmark
 */
const isValidBookmark = (bookmark: any): boolean => {
  if (!bookmark || typeof bookmark !== 'object') return false

  const { id, name, href, icon, order } = bookmark

  if (!id || typeof id !== 'string' || id.length > 100) return false
  if (!name || typeof name !== 'string' || name.length > 100) return false
  if (!isValidHref(href)) return false
  if (!icon || typeof icon !== 'string' || !VALID_ICONS.has(icon)) return false
  if (typeof order !== 'number' || order < 0 || !Number.isInteger(order)) return false

  return true
}

/**
 * Main validation function for MenuCustomizationData
 *
 * Performs comprehensive validation on incoming customization data
 */
export const validateMenuCustomization = (
  data: any
): ValidationResult => {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Data must be a valid object'] }
  }

  // Validate sectionOrder
  if (!Array.isArray(data.sectionOrder)) {
    errors.push('sectionOrder must be an array')
  } else {
    if (data.sectionOrder.length > 10) {
      errors.push('sectionOrder cannot have more than 10 items')
    }
    data.sectionOrder.forEach((section: any, index: number) => {
      if (!isValidSectionId(section)) {
        errors.push(`sectionOrder[${index}]: '${section}' is not a valid section ID`)
      }
    })
  }

  // Validate hiddenItems
  if (!Array.isArray(data.hiddenItems)) {
    errors.push('hiddenItems must be an array')
  } else {
    if (data.hiddenItems.length > 100) {
      errors.push('hiddenItems cannot have more than 100 items')
    }
    data.hiddenItems.forEach((item: any, index: number) => {
      if (!isValidHiddenItemPath(item)) {
        errors.push(`hiddenItems[${index}]: '${item}' is not a valid menu item path`)
      }
    })
  }

  // Validate practiceItems
  if (!Array.isArray(data.practiceItems)) {
    errors.push('practiceItems must be an array')
  } else {
    if (data.practiceItems.length > 100) {
      errors.push('practiceItems cannot have more than 100 items')
    }
    data.practiceItems.forEach((item: any, index: number) => {
      if (!isValidPracticeItem(item)) {
        errors.push(`practiceItems[${index}]: Invalid practice item structure`)
      }
    })
  }

  // Validate bookmarks
  if (!Array.isArray(data.bookmarks)) {
    errors.push('bookmarks must be an array')
  } else {
    if (data.bookmarks.length > 100) {
      errors.push('bookmarks cannot have more than 100 items')
    }
    data.bookmarks.forEach((bookmark: any, index: number) => {
      if (!isValidBookmark(bookmark)) {
        errors.push(`bookmarks[${index}]: Invalid bookmark structure`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitizes menu customization data before storage
 * Removes any unexpected fields and normalizes data
 */
export const sanitizeMenuCustomization = (
  data: MenuCustomizationData
): MenuCustomizationData => {
  return {
    sectionOrder: Array.isArray(data.sectionOrder) ? data.sectionOrder : [],
    hiddenItems: Array.isArray(data.hiddenItems) ? data.hiddenItems : [],
    practiceItems: Array.isArray(data.practiceItems) ? data.practiceItems : [],
    bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
  }
}
