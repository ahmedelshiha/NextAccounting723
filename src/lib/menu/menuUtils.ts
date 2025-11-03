/**
 * Menu Customization Utilities
 *
 * Provides functions to apply user customization to the menu structure,
 * including reordering sections, hiding items, and filtering based on permissions.
 */

import { MenuCustomizationData } from '@/types/admin/menuCustomization'

/**
 * Navigation item structure (matches AdminSidebar)
 */
export interface NavigationItem {
  name: string
  href: string
  icon: any // React component
  badge?: string | number
  permission?: string
  children?: NavigationItem[]
}

/**
 * Navigation section structure
 */
export interface NavigationSection {
  section: string
  items: NavigationItem[]
}

/**
 * Apply customization to navigation structure
 *
 * This function takes the default navigation structure and applies user customizations:
 * 1. Reorders sections based on sectionOrder
 * 2. Hides items based on hiddenItems
 *
 * @param navigation - Default navigation structure
 * @param customization - User's customization data
 * @returns Customized navigation structure
 */
export const applyCustomizationToNavigation = (
  navigation: NavigationSection[],
  customization: MenuCustomizationData | null
): NavigationSection[] => {
  if (!customization) {
    return navigation
  }

  // Step 1: Apply section order
  let sections = [...navigation]
  if (customization.sectionOrder && customization.sectionOrder.length > 0) {
    // Create a map for quick lookup
    const sectionMap = new Map(sections.map((s) => [s.section, s]))

    // Reorder sections based on customization
    const reordered: NavigationSection[] = []
    for (const sectionId of customization.sectionOrder) {
      const section = sectionMap.get(sectionId)
      if (section) {
        reordered.push(section)
        sectionMap.delete(sectionId)
      }
    }

    // Add any sections not in the custom order at the end
    for (const section of sectionMap.values()) {
      reordered.push(section)
    }

    sections = reordered
  }

  // Step 2: Filter out hidden items
  if (customization.hiddenItems && customization.hiddenItems.length > 0) {
    const hiddenSet = new Set(customization.hiddenItems)

    sections = sections.map((section) => {
      const filteredItems = section.items
        .filter((item) => !hiddenSet.has(item.href))
        .map((item) => ({
          ...item,
          children: item.children
            ? item.children.filter((child) => !hiddenSet.has(child.href))
            : undefined,
        }))
        .filter((item) => {
          // Keep items that have children with length > 0, or items with no children
          return !item.children || item.children.length > 0
        })

      return {
        ...section,
        items: filteredItems,
      }
    })
  }

  // Remove sections with no items, but keep sections if original had items with children
  sections = sections.filter((section) => {
    // Always keep sections that have items
    if (section.items && section.items.length > 0) {
      return true
    }

    // For empty sections, check if original section had items with children
    const original = navigation.find((s) => s.section === section.section)
    if (!original) {
      return false
    }

    // Preserve section if any original item had children
    const hadOriginalChildren = original.items.some(
      (item) => item.children && Array.isArray(item.children) && item.children.length > 0
    )

    return hadOriginalChildren
  })

  return sections
}

/**
 * Check if a navigation item path is hidden
 *
 * @param href - The href to check
 * @param customization - User's customization data
 * @returns true if the item is hidden
 */
export const isItemHidden = (
  href: string,
  customization: MenuCustomizationData | null
): boolean => {
  if (!customization || !customization.hiddenItems) {
    return false
  }

  return customization.hiddenItems.includes(href)
}

/**
 * Get the order of sections
 *
 * @param customization - User's customization data
 * @returns Array of section IDs in order
 */
export const getSectionOrder = (customization: MenuCustomizationData | null): string[] => {
  if (!customization || !customization.sectionOrder) {
    return ['dashboard', 'business', 'financial', 'operations', 'system']
  }

  return customization.sectionOrder
}
