import { describe, it, expect } from 'vitest'
import {
  ALL_MENU_ITEMS,
  DEFAULT_MENU_SECTIONS,
  getAllMenuItems,
  getMenuSection,
  getAllSectionIds,
  getMenuItem,
  isValidMenuItem,
} from '../defaultMenu'

describe('defaultMenu', () => {
  describe('ALL_MENU_ITEMS', () => {
    it('should be an object with menu items', () => {
      expect(typeof ALL_MENU_ITEMS).toBe('object')
      expect(Object.keys(ALL_MENU_ITEMS).length).toBeGreaterThan(0)
    })

    it('should have items with correct structure', () => {
      Object.entries(ALL_MENU_ITEMS).forEach(([key, item]) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('icon')
        expect(item.id).toBe(key)
      })
    })

    it('should include expected menu items', () => {
      expect(ALL_MENU_ITEMS['admin/']).toBeDefined()
      expect(ALL_MENU_ITEMS['admin/analytics']).toBeDefined()
      expect(ALL_MENU_ITEMS['admin/bookings']).toBeDefined()
      expect(ALL_MENU_ITEMS['admin/invoices']).toBeDefined()
      expect(ALL_MENU_ITEMS['admin/settings']).toBeDefined()
    })

    it('should have proper hrefs', () => {
      Object.entries(ALL_MENU_ITEMS).forEach(([, item]) => {
        expect(item.href).toMatch(/^\/admin/)
      })
    })

    it('should have valid icon names', () => {
      Object.entries(ALL_MENU_ITEMS).forEach(([, item]) => {
        expect(typeof item.icon).toBe('string')
        expect(item.icon.length).toBeGreaterThan(0)
      })
    })
  })

  describe('DEFAULT_MENU_SECTIONS', () => {
    it('should be an array with 5 sections', () => {
      expect(Array.isArray(DEFAULT_MENU_SECTIONS)).toBe(true)
      expect(DEFAULT_MENU_SECTIONS.length).toBe(5)
    })

    it('should have correct section IDs', () => {
      const sectionIds = DEFAULT_MENU_SECTIONS.map((s) => s.id)
      expect(sectionIds).toContain('dashboard')
      expect(sectionIds).toContain('business')
      expect(sectionIds).toContain('financial')
      expect(sectionIds).toContain('operations')
      expect(sectionIds).toContain('system')
    })

    it('should have sections with required properties', () => {
      DEFAULT_MENU_SECTIONS.forEach((section) => {
        expect(section).toHaveProperty('id')
        expect(section).toHaveProperty('name')
        expect(section).toHaveProperty('order')
        expect(section).toHaveProperty('items')
        expect(Array.isArray(section.items)).toBe(true)
        expect(section.items.length).toBeGreaterThan(0)
      })
    })

    it('should have correct order for sections', () => {
      expect(DEFAULT_MENU_SECTIONS[0].order).toBe(0)
      expect(DEFAULT_MENU_SECTIONS[1].order).toBe(1)
      expect(DEFAULT_MENU_SECTIONS[2].order).toBe(2)
      expect(DEFAULT_MENU_SECTIONS[3].order).toBe(3)
      expect(DEFAULT_MENU_SECTIONS[4].order).toBe(4)
    })

    it('should have dashboard as first section', () => {
      expect(DEFAULT_MENU_SECTIONS[0].id).toBe('dashboard')
    })

    it('should have all items in sections', () => {
      const allSectionItems = DEFAULT_MENU_SECTIONS.flatMap((s) => s.items)
      allSectionItems.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('icon')
      })
    })

    it('should have consistent items across sections and ALL_MENU_ITEMS', () => {
      DEFAULT_MENU_SECTIONS.forEach((section) => {
        section.items.forEach((item) => {
          expect(ALL_MENU_ITEMS[item.id]).toBeDefined()
          expect(ALL_MENU_ITEMS[item.id]).toEqual(item)
        })
      })
    })
  })

  describe('getAllMenuItems', () => {
    it('should return array of all menu items', () => {
      const items = getAllMenuItems()
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBe(Object.keys(ALL_MENU_ITEMS).length)
    })

    it('should not have duplicates', () => {
      const items = getAllMenuItems()
      const ids = items.map((item) => item.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should include items from all sections', () => {
      const items = getAllMenuItems()
      const ids = new Set(items.map((item) => item.id))

      DEFAULT_MENU_SECTIONS.forEach((section) => {
        section.items.forEach((item) => {
          expect(ids.has(item.id)).toBe(true)
        })
      })
    })
  })

  describe('getMenuSection', () => {
    it('should return section by ID', () => {
      const section = getMenuSection('dashboard')
      expect(section).toBeDefined()
      expect(section?.id).toBe('dashboard')
      expect(section?.name).toBe('Dashboard')
    })

    it('should return undefined for invalid section ID', () => {
      const section = getMenuSection('invalid')
      expect(section).toBeUndefined()
    })

    it('should return section with all properties', () => {
      const section = getMenuSection('business')
      expect(section?.id).toBe('business')
      expect(section?.name).toBeDefined()
      expect(section?.order).toBeDefined()
      expect(Array.isArray(section?.items)).toBe(true)
    })

    it('should return correct section items', () => {
      const section = getMenuSection('business')
      const itemIds = section?.items.map((item) => item.id) || []

      expect(itemIds).toContain('admin/bookings')
      expect(itemIds).toContain('admin/clients')
      expect(itemIds).toContain('admin/services')
    })
  })

  describe('getAllSectionIds', () => {
    it('should return all section IDs', () => {
      const ids = getAllSectionIds()
      expect(Array.isArray(ids)).toBe(true)
      expect(ids.length).toBe(5)
    })

    it('should return correct section IDs in order', () => {
      const ids = getAllSectionIds()
      expect(ids[0]).toBe('dashboard')
      expect(ids[1]).toBe('business')
      expect(ids[2]).toBe('financial')
      expect(ids[3]).toBe('operations')
      expect(ids[4]).toBe('system')
    })
  })

  describe('getMenuItem', () => {
    it('should return menu item by ID', () => {
      const item = getMenuItem('admin/analytics')
      expect(item).toBeDefined()
      expect(item?.id).toBe('admin/analytics')
      expect(item?.name).toBe('Analytics')
    })

    it('should return undefined for invalid item ID', () => {
      const item = getMenuItem('invalid/path')
      expect(item).toBeUndefined()
    })

    it('should return item with all properties', () => {
      const item = getMenuItem('admin/bookings')
      expect(item?.id).toBe('admin/bookings')
      expect(item?.name).toBe('Bookings')
      expect(item?.href).toBe('/admin/bookings')
      expect(item?.icon).toBe('Calendar')
    })

    it('should match items in ALL_MENU_ITEMS', () => {
      const item = getMenuItem('admin/clients')
      expect(item).toEqual(ALL_MENU_ITEMS['admin/clients'])
    })
  })

  describe('isValidMenuItem', () => {
    it('should return true for valid menu items', () => {
      expect(isValidMenuItem('admin/')).toBe(true)
      expect(isValidMenuItem('admin/analytics')).toBe(true)
      expect(isValidMenuItem('admin/bookings')).toBe(true)
      expect(isValidMenuItem('admin/settings')).toBe(true)
    })

    it('should return false for invalid menu items', () => {
      expect(isValidMenuItem('invalid')).toBe(false)
      expect(isValidMenuItem('invalid/path')).toBe(false)
      expect(isValidMenuItem('admin/nonexistent')).toBe(false)
    })

    it('should handle empty string', () => {
      expect(isValidMenuItem('')).toBe(false)
    })

    it('should be consistent with getMenuItem', () => {
      const validIds = ['admin/', 'admin/analytics', 'admin/bookings']
      const invalidIds = ['invalid', 'nonexistent', 'admin/xyz']

      validIds.forEach((id) => {
        expect(isValidMenuItem(id)).toBe(getMenuItem(id) !== undefined)
      })

      invalidIds.forEach((id) => {
        expect(isValidMenuItem(id)).toBe(getMenuItem(id) !== undefined)
      })
    })
  })

  describe('Menu structure consistency', () => {
    it('should have no orphaned items in sections', () => {
      DEFAULT_MENU_SECTIONS.forEach((section) => {
        section.items.forEach((item) => {
          expect(ALL_MENU_ITEMS[item.id]).toBeDefined()
        })
      })
    })

    it('should have all dashboard items in first section', () => {
      const dashboardSection = DEFAULT_MENU_SECTIONS[0]
      expect(dashboardSection.id).toBe('dashboard')
      expect(dashboardSection.items.length).toBeGreaterThan(0)
      dashboardSection.items.forEach((item) => {
        expect(item.href).toMatch(/^\/admin\/?$|^\/admin\/[^/]+$/)
      })
    })

    it('should have unique item IDs across all sections', () => {
      const allItemIds: string[] = []
      DEFAULT_MENU_SECTIONS.forEach((section) => {
        section.items.forEach((item) => {
          allItemIds.push(item.id)
        })
      })

      const uniqueIds = new Set(allItemIds)
      expect(allItemIds.length).toBe(uniqueIds.size)
    })
  })
})
