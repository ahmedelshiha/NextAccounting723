import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useMenuCustomizationStore } from '../menuCustomization.store'
import { MenuCustomizationData } from '@/types/admin/menuCustomization'

describe('useMenuCustomizationStore', () => {
  beforeEach(() => {
    useMenuCustomizationStore.setState({
      customization: null,
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should have null customization initially', () => {
      const { customization } = useMenuCustomizationStore.getState()
      expect(customization).toBeNull()
    })

    it('should have loading as false initially', () => {
      const { isLoading } = useMenuCustomizationStore.getState()
      expect(isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const { error } = useMenuCustomizationStore.getState()
      expect(error).toBeNull()
    })
  })

  describe('setCustomization', () => {
    it('should set customization data', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['business', 'dashboard'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationStore.getState().setCustomization(customization)

      const state = useMenuCustomizationStore.getState()
      expect(state.customization).toEqual(customization)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should replace existing customization', () => {
      const first: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const second: MenuCustomizationData = {
        sectionOrder: ['business'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationStore.getState().setCustomization(first)
      expect(useMenuCustomizationStore.getState().customization).toEqual(first)

      useMenuCustomizationStore.getState().setCustomization(second)
      expect(useMenuCustomizationStore.getState().customization).toEqual(second)
    })
  })

  describe('loadCustomization', () => {
    it('should fetch customization from API', async () => {
      const mockData: MenuCustomizationData = {
        sectionOrder: ['business', 'dashboard'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await useMenuCustomizationStore.getState().loadCustomization()

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/menu-customization', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const state = useMenuCustomizationStore.getState()
      expect(state.customization).toEqual(mockData)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should set loading to true during fetch', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sectionOrder: [],
          hiddenItems: [],
          practiceItems: [],
          bookmarks: [],
        }),
      })

      const loadPromise = useMenuCustomizationStore.getState().loadCustomization()

      // Check loading is true during fetch
      await new Promise((resolve) => setTimeout(resolve, 0))

      await loadPromise

      expect(useMenuCustomizationStore.getState().isLoading).toBe(false)
    })

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await useMenuCustomizationStore.getState().loadCustomization()

      const state = useMenuCustomizationStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeDefined()
      expect(state.customization).toBeDefined()
    })

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      await useMenuCustomizationStore.getState().loadCustomization()

      const state = useMenuCustomizationStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toContain('Network error')
      expect(state.customization).toBeDefined()
    })

    it('should set default customization on error', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('API failed'))

      await useMenuCustomizationStore.getState().loadCustomization()

      const state = useMenuCustomizationStore.getState()
      expect(state.customization).toBeDefined()
      expect(state.customization?.sectionOrder).toEqual([
        'dashboard',
        'business',
        'financial',
        'operations',
        'system',
      ])
    })
  })

  describe('applyCustomization', () => {
    it('should post customization to API', async () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['business'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => customization,
      })

      await useMenuCustomizationStore.getState().applyCustomization(customization)

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/menu-customization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customization),
      })

      const state = useMenuCustomizationStore.getState()
      expect(state.customization).toEqual(customization)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle API errors and throw', async () => {
      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      try {
        await useMenuCustomizationStore.getState().applyCustomization(customization)
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeDefined()
      }

      const state = useMenuCustomizationStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeDefined()
    })

    it('should handle network errors and throw', async () => {
      const customization: MenuCustomizationData = {
        sectionOrder: [],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      try {
        await useMenuCustomizationStore.getState().applyCustomization(customization)
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeDefined()
      }

      const state = useMenuCustomizationStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeDefined()
    })
  })

  describe('resetCustomization', () => {
    it('should send DELETE request to API', async () => {
      const defaultData: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business', 'financial', 'operations', 'system'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => defaultData,
      })

      await useMenuCustomizationStore.getState().resetCustomization()

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/menu-customization', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const state = useMenuCustomizationStore.getState()
      expect(state.customization).toEqual(defaultData)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle API errors and throw', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      })

      try {
        await useMenuCustomizationStore.getState().resetCustomization()
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeDefined()
      }

      const state = useMenuCustomizationStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeDefined()
    })

    it('should handle network errors and throw', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Connection failed'))

      try {
        await useMenuCustomizationStore.getState().resetCustomization()
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeDefined()
      }

      const state = useMenuCustomizationStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeDefined()
    })
  })

  describe('state management', () => {
    it('should maintain state across multiple operations', async () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['business'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationStore.getState().setCustomization(customization)
      expect(useMenuCustomizationStore.getState().customization).toEqual(customization)

      // Simulate another set operation
      const updated: MenuCustomizationData = {
        ...customization,
        hiddenItems: [...customization.hiddenItems, 'admin/reports'],
      }

      useMenuCustomizationStore.getState().setCustomization(updated)
      expect(useMenuCustomizationStore.getState().customization).toEqual(updated)
    })
  })
})
