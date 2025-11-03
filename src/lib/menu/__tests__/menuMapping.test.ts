import { describe, it, expect } from 'vitest'
import {
  ItemCategory,
  getPracticeItems,
  getYourBooksItems,
  getItemsByCategory,
  getItemCategory,
  getBookmarkableItems,
} from '../menuMapping'

describe('menuMapping', () => {
  describe('getPracticeItems', () => {
    it('should return practice items with correct structure', () => {
      const items = getPracticeItems()
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)

      items.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('order')
        expect(item).toHaveProperty('visible')
        expect(typeof item.visible).toBe('boolean')
      })
    })

    it('should include expected practice items', () => {
      const items = getPracticeItems()
      const ids = items.map((item) => item.id)

      expect(ids).toContain('admin/bookings')
      expect(ids).toContain('admin/clients')
      expect(ids).toContain('admin/services')
    })

    it('should have correct order values', () => {
      const items = getPracticeItems()
      items.forEach((item, index) => {
        expect(item.order).toBe(index)
      })
    })
  })

  describe('getYourBooksItems', () => {
    it('should return books items with correct structure', () => {
      const items = getYourBooksItems()
      expect(Array.isArray(items)).toBe(true)

      items.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('order')
        expect(item).toHaveProperty('visible')
      })
    })

    it('should include financial items', () => {
      const items = getYourBooksItems()
      const ids = items.map((item) => item.id)

      expect(ids).toContain('admin/invoices')
      expect(ids).toContain('admin/payments')
      expect(ids).toContain('admin/expenses')
      expect(ids).toContain('admin/taxes')
    })

    it('should all be visible by default', () => {
      const items = getYourBooksItems()
      items.forEach((item) => {
        expect(item.visible).toBe(true)
      })
    })
  })

  describe('getItemsByCategory', () => {
    it('should return practice items for YOUR_PRACTICE category', () => {
      const items = getItemsByCategory(ItemCategory.YOUR_PRACTICE)
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)

      const practiceItems = getPracticeItems()
      expect(items).toEqual(practiceItems)
    })

    it('should return books items for YOUR_BOOKS category', () => {
      const items = getItemsByCategory(ItemCategory.YOUR_BOOKS)
      expect(Array.isArray(items)).toBe(true)

      const booksItems = getYourBooksItems()
      expect(items).toEqual(booksItems)
    })

    it('should return empty array for BOOKMARKS category', () => {
      const items = getItemsByCategory(ItemCategory.BOOKMARKS)
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBe(0)
    })

    it('should return empty array for invalid category', () => {
      const items = getItemsByCategory('invalid' as any)
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBe(0)
    })
  })

  describe('getItemCategory', () => {
    it('should return YOUR_PRACTICE for practice items', () => {
      const practiceItems = getPracticeItems()
      practiceItems.forEach((item) => {
        expect(getItemCategory(item.id)).toBe(ItemCategory.YOUR_PRACTICE)
      })
    })

    it('should return YOUR_BOOKS for financial items', () => {
      const booksItems = getYourBooksItems()
      booksItems.forEach((item) => {
        expect(getItemCategory(item.id)).toBe(ItemCategory.YOUR_BOOKS)
      })
    })

    it('should return null for non-categorized items', () => {
      expect(getItemCategory('admin/analytics')).toBeNull()
      expect(getItemCategory('admin/')).toBeNull()
      expect(getItemCategory('invalid/path')).toBeNull()
    })
  })

  describe('getBookmarkableItems', () => {
    it('should return array of bookmarkable items', () => {
      const items = getBookmarkableItems()
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)
    })

    it('should exclude overview item', () => {
      const items = getBookmarkableItems()
      const ids = items.map((item) => item.id)
      expect(ids).not.toContain('admin/')
    })

    it('should have required properties for all items', () => {
      const items = getBookmarkableItems()
      items.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('icon')
      })
    })

    it('should include common menu items', () => {
      const items = getBookmarkableItems()
      const ids = items.map((item) => item.id)

      expect(ids.length).toBeGreaterThan(0)
      expect(ids.some((id) => id.includes('admin/'))).toBe(true)
    })
  })
})
