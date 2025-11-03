/**
 * Menu Mapping Logic
 *
 * Defines the mapping of default menu items to categories in the customization modal:
 * - "Your Books" (Hidden/Future): Financial-related items for business accounts
 * - "Your Practice": Dynamic, practice-specific items for service providers
 *
 * This logic determines which items appear in which modal tabs.
 */

import { MenuItem, PracticeItem } from '@/types/admin/menuCustomization'
import { ALL_MENU_ITEMS } from './defaultMenu'

/**
 * Item categories for the customization modal
 */
export enum ItemCategory {
  BOOKMARKS = 'bookmarks',
  YOUR_PRACTICE = 'your-practice',
  YOUR_BOOKS = 'your-books',
}

/**
 * Map menu items to modal categories
 *
 * Items can appear in multiple contexts:
 * - "Sections" tab: All section-level items for reordering
 * - "Your Practice" tab: Practice-specific items (dynamic)
 * - "Your Books" tab: Financial/accounting specific items (hidden/future)
 * - "Bookmarks" tab: User-bookmarked items
 */

/**
 * Get all items that belong to the "Your Practice" category
 *
 * These are typically items related to service delivery,
 * client management, and operational workflows.
 */
export const getPracticeItems = (): PracticeItem[] => {
  const practiceItemIds = [
    'admin/bookings',
    'admin/clients',
    'admin/services',
    'admin/service-requests',
    'admin/team',
    'admin/chat',
    'admin/tasks',
  ]

  return practiceItemIds
    .map((id) => {
      const item = ALL_MENU_ITEMS[id]
      if (!item) return null

      return {
        id: item.id,
        name: item.name,
        icon: item.icon || 'Briefcase',
        href: item.href || '',
        order: practiceItemIds.indexOf(id),
        visible: true,
      }
    })
    .filter((item) => item !== null) as PracticeItem[]
}

/**
 * Get all items that belong to the "Your Books" category
 *
 * These are typically items related to financial management,
 * accounting, and reporting. Currently hidden/future.
 */
export const getYourBooksItems = (): PracticeItem[] => {
  const booksItemIds = [
    'admin/invoices',
    'admin/payments',
    'admin/expenses',
    'admin/taxes',
  ]

  return booksItemIds
    .map((id) => {
      const item = ALL_MENU_ITEMS[id]
      if (!item) return null

      return {
        id: item.id,
        name: item.name,
        icon: item.icon || 'DollarSign',
        href: item.href || '',
        order: booksItemIds.indexOf(id),
        visible: true,
      }
    })
    .filter((item) => item !== null) as PracticeItem[]
}

/**
 * Get items by category
 *
 * @param category - The category to fetch items for
 * @returns Array of items in that category
 */
export const getItemsByCategory = (category: ItemCategory): PracticeItem[] => {
  switch (category) {
    case ItemCategory.YOUR_PRACTICE:
      return getPracticeItems()
    case ItemCategory.YOUR_BOOKS:
      return getYourBooksItems()
    default:
      return []
  }
}

/**
 * Determine which category an item belongs to
 *
 * @param itemId - The ID of the menu item
 * @returns The category the item belongs to, or null if not categorized
 */
export const getItemCategory = (itemId: string): ItemCategory | null => {
  if (getPracticeItems().some((item) => item.id === itemId)) {
    return ItemCategory.YOUR_PRACTICE
  }

  if (getYourBooksItems().some((item) => item.id === itemId)) {
    return ItemCategory.YOUR_BOOKS
  }

  return null
}

/**
 * Get searchable items for the bookmarks tab
 *
 * Returns all available items that can be bookmarked
 */
export const getBookmarkableItems = (): MenuItem[] => {
  return Object.values(ALL_MENU_ITEMS).filter((item) => {
    // Exclude top-level overview item
    return item.id !== 'admin/'
  })
}
