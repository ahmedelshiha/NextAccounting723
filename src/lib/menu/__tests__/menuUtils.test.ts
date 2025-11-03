import { describe, it, expect, beforeEach } from 'vitest'
import {
  applyCustomizationToNavigation,
  isItemHidden,
  getSectionOrder,
  NavigationSection,
  NavigationItem,
} from '../menuUtils'
import { MenuCustomizationData } from '@/types/admin/menuCustomization'

describe('menuUtils', () => {
  const mockNavigation: NavigationSection[] = [
    {
      section: 'dashboard',
      items: [
        {
          name: 'Overview',
          href: '/admin',
          icon: 'LayoutDashboard',
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: 'BarChart3',
        },
      ],
    },
    {
      section: 'business',
      items: [
        {
          name: 'Bookings',
          href: '/admin/bookings',
          icon: 'Calendar',
        },
        {
          name: 'Clients',
          href: '/admin/clients',
          icon: 'Users',
        },
      ],
    },
    {
      section: 'financial',
      items: [
        {
          name: 'Invoices',
          href: '/admin/invoices',
          icon: 'FileText',
        },
      ],
    },
  ]

  describe('applyCustomizationToNavigation', () => {
    it('should return original navigation if no customization', () => {
      const result = applyCustomizationToNavigation(mockNavigation, null)
      expect(result).toEqual(mockNavigation)
    })

    it('should reorder sections based on sectionOrder', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['financial', 'dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)

      expect(result[0].section).toBe('financial')
      expect(result[1].section).toBe('dashboard')
      expect(result[2].section).toBe('business')
    })

    it('should handle partial section order', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)

      expect(result[0].section).toBe('business')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should hide items based on hiddenItems', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: ['/admin/analytics', '/admin/invoices'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)

      const allHrefs = result
        .flatMap((section) => section.items)
        .map((item) => item.href)

      expect(allHrefs).not.toContain('/admin/analytics')
      expect(allHrefs).not.toContain('/admin/invoices')
      expect(allHrefs).toContain('/admin')
      expect(allHrefs).toContain('/admin/bookings')
    })

    it('should remove sections with no items after filtering', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: ['/admin/invoices'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)
      const sections = result.map((s) => s.section)

      expect(sections).not.toContain('financial')
    })

    it('should apply both section reordering and item hiding', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['business', 'dashboard'],
        hiddenItems: ['/admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)

      expect(result[0].section).toBe('business')
      expect(result[1].section).toBe('dashboard')

      const dashboardItems = result.find((s) => s.section === 'dashboard')?.items
      const hrefs = dashboardItems?.map((item) => item.href) || []

      expect(hrefs).not.toContain('/admin/analytics')
      expect(hrefs).toContain('/admin')
    })

    it('should handle nested children filtering', () => {
      const navigationWithChildren: NavigationSection[] = [
        {
          section: 'business',
          items: [
            {
              name: 'Clients',
              href: '/admin/clients',
              icon: 'Users',
              children: [
                {
                  name: 'Profiles',
                  href: '/admin/clients/profiles',
                  icon: 'Users',
                },
                {
                  name: 'Invitations',
                  href: '/admin/clients/invitations',
                  icon: 'Mail',
                },
              ],
            },
          ],
        },
      ]

      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: ['/admin/clients/invitations'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(navigationWithChildren, customization)
      const clients = result[0]?.items[0]

      expect(clients?.children).toBeDefined()
      expect(clients?.children?.length).toBe(1)
      expect(clients?.children?.[0].href).toBe('/admin/clients/profiles')
    })

    it('should remove parent items when all children are hidden', () => {
      const navigationWithChildren: NavigationSection[] = [
        {
          section: 'business',
          items: [
            {
              name: 'Clients',
              href: '/admin/clients',
              icon: 'Users',
              children: [
                {
                  name: 'Profiles',
                  href: '/admin/clients/profiles',
                  icon: 'Users',
                },
              ],
            },
          ],
        },
      ]

      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: ['/admin/clients/profiles'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(navigationWithChildren, customization)

      expect(result[0]?.items.length).toBe(0)
    })
  })

  describe('isItemHidden', () => {
    const customization: MenuCustomizationData = {
      sectionOrder: [],
      hiddenItems: ['/admin/analytics', '/admin/reports'],
      practiceItems: [],
      bookmarks: [],
    }

    it('should return true for hidden items', () => {
      expect(isItemHidden('/admin/analytics', customization)).toBe(true)
      expect(isItemHidden('/admin/reports', customization)).toBe(true)
    })

    it('should return false for visible items', () => {
      expect(isItemHidden('/admin', customization)).toBe(false)
      expect(isItemHidden('/admin/bookings', customization)).toBe(false)
    })

    it('should return false when customization is null', () => {
      expect(isItemHidden('/admin/analytics', null)).toBe(false)
    })

    it('should return false when hiddenItems is empty', () => {
      const emptyCustomization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      expect(isItemHidden('/admin/analytics', emptyCustomization)).toBe(false)
    })
  })

  describe('getSectionOrder', () => {
    it('should return custom section order from customization', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['financial', 'business', 'dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const result = getSectionOrder(customization)
      expect(result).toEqual(['financial', 'business', 'dashboard'])
    })

    it('should return default order when customization is null', () => {
      const result = getSectionOrder(null)
      expect(result).toEqual(['dashboard', 'business', 'financial', 'operations', 'system'])
    })

    it('should return default order when sectionOrder is empty', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const result = getSectionOrder(customization)
      expect(result).toEqual([])
    })

    it('should return default order when customization has no sectionOrder', () => {
      const customization = {
        sectionOrder: undefined,
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      } as any

      const result = getSectionOrder(customization)
      expect(result).toEqual(['dashboard', 'business', 'financial', 'operations', 'system'])
    })
  })
})
