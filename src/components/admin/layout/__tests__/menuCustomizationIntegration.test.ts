import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useMenuCustomizationStore } from '@/stores/admin/menuCustomization.store'
import { useMenuCustomizationModalStore } from '@/stores/admin/menuCustomizationModal.store'
import { MenuCustomizationData } from '@/types/admin/menuCustomization'
import { applyCustomizationToNavigation, getSectionOrder } from '@/lib/menu/menuUtils'
import { DEFAULT_MENU_SECTIONS, getMenuItem } from '@/lib/menu/defaultMenu'

describe('Menu Customization Integration Tests', () => {
  beforeEach(() => {
    useMenuCustomizationStore.setState({
      customization: null,
      isLoading: false,
      error: null,
    })

    useMenuCustomizationModalStore.setState({
      draftCustomization: null,
      isDirty: false,
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Full user workflow: Open Modal -> Edit -> Save -> Apply', () => {
    it('should complete full customization workflow', async () => {
      const mockData: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business', 'financial', 'operations', 'system'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      // Step 1: Load initial customization
      await useMenuCustomizationStore.getState().loadCustomization()
      const loadedCustomization = useMenuCustomizationStore.getState().customization
      expect(loadedCustomization).toEqual(mockData)

      // Step 2: Initialize modal with current customization
      useMenuCustomizationModalStore.getState().initializeDraft(loadedCustomization!)
      expect(useMenuCustomizationModalStore.getState().draftCustomization).toEqual(mockData)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)

      // Step 3: User reorders sections
      const newOrder = ['business', 'dashboard', 'financial', 'operations', 'system']
      useMenuCustomizationModalStore.getState().setSectionOrder(newOrder)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)

      // Step 4: User hides an item
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')
      const draft = useMenuCustomizationModalStore.getState().draftCustomization!
      expect(draft.hiddenItems).toContain('admin/analytics')

      // Step 5: User saves changes
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...draft }),
      })

      await useMenuCustomizationStore.getState().applyCustomization(draft)
      const savedCustomization = useMenuCustomizationStore.getState().customization

      expect(savedCustomization?.sectionOrder).toEqual(newOrder)
      expect(savedCustomization?.hiddenItems).toContain('admin/analytics')
      expect(useMenuCustomizationStore.getState().error).toBeNull()
    })

    it('should cancel changes and revert draft', async () => {
      const mockData: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationStore.getState().setCustomization(mockData)

      // Initialize modal
      useMenuCustomizationModalStore.getState().initializeDraft(mockData)

      // Make changes
      useMenuCustomizationModalStore.getState().setSectionOrder(['business', 'dashboard'])
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')

      // Cancel - clear draft without saving
      useMenuCustomizationModalStore.getState().clearDraft()

      // Verify main store still has original data
      const mainStore = useMenuCustomizationStore.getState().customization
      expect(mainStore?.sectionOrder).toEqual(['dashboard', 'business'])
      expect(mainStore?.hiddenItems).not.toContain('admin/analytics')
    })

    it('should reset to defaults and apply', async () => {
      const currentCustomization: MenuCustomizationData = {
        sectionOrder: ['business', 'dashboard'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationStore.getState().setCustomization(currentCustomization)

      const defaultCustomization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business', 'financial', 'operations', 'system'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => defaultCustomization,
      })

      await useMenuCustomizationStore.getState().resetCustomization()

      const reset = useMenuCustomizationStore.getState().customization
      expect(reset?.hiddenItems.length).toBe(0)
      expect(reset?.sectionOrder).toEqual(defaultCustomization.sectionOrder)
    })
  })

  describe('Navigation data transformation', () => {
    it('should correctly apply customization to navigation structure', () => {
      const mockNavigation = DEFAULT_MENU_SECTIONS.map((section) => ({
        section: section.id,
        items: section.items,
      }))

      const customization: MenuCustomizationData = {
        sectionOrder: ['financial', 'business', 'dashboard'],
        hiddenItems: ['admin/analytics', 'admin/reports'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)

      // Verify section order
      const resultSections = result.map((s) => s.section)
      expect(resultSections[0]).toBe('financial')
      expect(resultSections[1]).toBe('business')

      // Verify hidden items are filtered
      const allItems = result.flatMap((s) => s.items)
      const hrefs = allItems.map((i) => i.href)
      expect(hrefs).not.toContain('/admin/analytics')
      expect(hrefs).not.toContain('/admin/reports')
    })

    it('should handle edge case where all items in section are hidden', () => {
      const mockNavigation = DEFAULT_MENU_SECTIONS.map((section) => ({
        section: section.id,
        items: section.items,
      }))

      const dashboardItems = mockNavigation
        .find((s) => s.section === 'dashboard')
        ?.items.map((item) => item.href) || []

      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: dashboardItems,
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)
      const resultSections = result.map((s) => s.section)

      expect(resultSections).not.toContain('dashboard')
    })

    it('should preserve items not in customization hiddenItems', () => {
      const mockNavigation = DEFAULT_MENU_SECTIONS.map((section) => ({
        section: section.id,
        items: section.items,
      }))

      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = applyCustomizationToNavigation(mockNavigation, customization)
      const allItems = result.flatMap((s) => s.items)
      const hrefs = allItems.map((i) => i.href)

      expect(hrefs).toContain('/admin')
      expect(hrefs).toContain('/admin/bookings')
      expect(hrefs).toContain('/admin/clients')
      expect(hrefs).not.toContain('/admin/analytics')
    })
  })

  describe('State synchronization between stores', () => {
    it('should keep modal and main store in sync on save', async () => {
      const originalCustomization: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationStore.getState().setCustomization(originalCustomization)

      // Initialize modal with main store data
      useMenuCustomizationModalStore.getState().initializeDraft(originalCustomization)

      // Make changes in modal
      const updatedOrder = ['business', 'dashboard']
      useMenuCustomizationModalStore.getState().setSectionOrder(updatedOrder)

      // Get draft and apply to main store
      const draft = useMenuCustomizationModalStore.getState().getDraftData()!
      useMenuCustomizationStore.getState().setCustomization(draft)

      // Verify both are now in sync
      const mainStore = useMenuCustomizationStore.getState().customization
      const modalStore = useMenuCustomizationModalStore.getState().draftCustomization

      expect(mainStore?.sectionOrder).toEqual(updatedOrder)
      expect(modalStore?.sectionOrder).toEqual(updatedOrder)
    })

    it('should detect and track dirty state correctly', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)

      // Make a change
      useMenuCustomizationModalStore.getState().setSectionOrder(['business', 'dashboard'])
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)

      // Revert the change
      useMenuCustomizationModalStore.getState().setSectionOrder(['dashboard', 'business'])
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)
    })
  })

  describe('Error handling and recovery', () => {
    it('should handle load error and set default customization', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      await useMenuCustomizationStore.getState().loadCustomization()

      const state = useMenuCustomizationStore.getState()
      expect(state.error).toContain('Network error')
      expect(state.customization?.sectionOrder).toEqual([
        'dashboard',
        'business',
        'financial',
        'operations',
        'system',
      ])
    })

    it('should handle save error and keep previous customization', async () => {
      const previousCustomization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationStore.getState().setCustomization(previousCustomization)

      const newCustomization: MenuCustomizationData = {
        sectionOrder: ['business', 'dashboard'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error',
      })

      try {
        await useMenuCustomizationStore.getState().applyCustomization(newCustomization)
      } catch (error) {
        // Expected error
      }

      const state = useMenuCustomizationStore.getState()
      expect(state.error).toBeDefined()
      // Previous customization should be preserved
      expect(state.customization?.sectionOrder).toEqual(['dashboard', 'business'])
    })

    it('should allow retry after error', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      // First attempt fails
      await useMenuCustomizationStore.getState().loadCustomization()
      expect(useMenuCustomizationStore.getState().error).toBeDefined()

      // Mock success response for retry
      const mockData: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      // Retry succeeds
      await useMenuCustomizationStore.getState().loadCustomization()
      expect(useMenuCustomizationStore.getState().customization).toEqual(mockData)
      expect(useMenuCustomizationStore.getState().error).toBeNull()
    })
  })

  describe('Complex user interactions', () => {
    it('should handle multiple reorderings in sequence', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business', 'financial'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)

      useMenuCustomizationModalStore
        .getState()
        .setSectionOrder(['business', 'dashboard', 'financial'])
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)

      useMenuCustomizationModalStore
        .getState()
        .setSectionOrder(['financial', 'business', 'dashboard'])
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.sectionOrder).toEqual(['financial', 'business', 'dashboard'])
    })

    it('should handle adding and removing multiple hidden items', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)

      const itemsToHide = ['admin/analytics', 'admin/reports', 'admin/settings']
      itemsToHide.forEach((item) => {
        useMenuCustomizationModalStore.getState().addHiddenItem(item)
      })

      let draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.hiddenItems.length).toBe(3)

      useMenuCustomizationModalStore
        .getState()
        .removeHiddenItem('admin/reports')

      draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.hiddenItems).toContain('admin/analytics')
      expect(draft?.hiddenItems).not.toContain('admin/reports')
      expect(draft?.hiddenItems).toContain('admin/settings')
    })
  })

  describe('Data persistence across operations', () => {
    it('should preserve customization data after multiple save cycles', async () => {
      const initialCustomization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => initialCustomization,
      })

      await useMenuCustomizationStore.getState().loadCustomization()
      let currentCustomization = useMenuCustomizationStore.getState().customization

      expect(currentCustomization).toEqual(initialCustomization)

      // Second cycle - modify and save
      const modified: MenuCustomizationData = {
        ...initialCustomization,
        sectionOrder: ['business', 'dashboard'],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => modified,
      })

      await useMenuCustomizationStore.getState().applyCustomization(modified)
      currentCustomization = useMenuCustomizationStore.getState().customization

      expect(currentCustomization?.sectionOrder).toEqual(['business', 'dashboard'])
      expect(currentCustomization?.hiddenItems).toEqual(initialCustomization.hiddenItems)
    })
  })
})
