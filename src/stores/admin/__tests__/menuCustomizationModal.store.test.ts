import { describe, it, expect, beforeEach } from 'vitest'
import { useMenuCustomizationModalStore } from '../menuCustomizationModal.store'
import { MenuCustomizationData, PracticeItem, Bookmark } from '@/types/admin/menuCustomization'

describe('useMenuCustomizationModalStore', () => {
  beforeEach(() => {
    useMenuCustomizationModalStore.setState({
      draftCustomization: null,
      isDirty: false,
    })
  })

  describe('initial state', () => {
    it('should have null draftCustomization initially', () => {
      const { draftCustomization } = useMenuCustomizationModalStore.getState()
      expect(draftCustomization).toBeNull()
    })

    it('should have isDirty as false initially', () => {
      const { isDirty } = useMenuCustomizationModalStore.getState()
      expect(isDirty).toBe(false)
    })
  })

  describe('initializeDraft', () => {
    it('should set draftCustomization', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)

      const state = useMenuCustomizationModalStore.getState()
      expect(state.draftCustomization).toEqual(customization)
      expect(state.isDirty).toBe(false)
    })

    it('should create a deep copy', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft).toEqual(customization)
      expect(draft).not.toBe(customization)
    })

    it('should reset isDirty after initialization', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)
    })
  })

  describe('clearDraft', () => {
    it('should clear draftCustomization', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      useMenuCustomizationModalStore.getState().clearDraft()

      const state = useMenuCustomizationModalStore.getState()
      expect(state.draftCustomization).toBeNull()
      expect(state.isDirty).toBe(false)
    })
  })

  describe('setSectionOrder', () => {
    it('should update section order in draft', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      useMenuCustomizationModalStore.getState().setSectionOrder(['business', 'dashboard'])

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.sectionOrder).toEqual(['business', 'dashboard'])
    })

    it('should mark as dirty when section order changes', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)

      useMenuCustomizationModalStore.getState().setSectionOrder(['business', 'dashboard'])
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)
    })

    it('should not mark as dirty if section order is same', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      useMenuCustomizationModalStore.getState().setSectionOrder(['dashboard', 'business'])

      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)
    })
  })

  describe('hidden items mutations', () => {
    const customization: MenuCustomizationData = {
      sectionOrder: [],
      hiddenItems: [],
      practiceItems: [],
      bookmarks: [],
    }

    beforeEach(() => {
      useMenuCustomizationModalStore.getState().initializeDraft(customization)
    })

    it('should add hidden item', () => {
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.hiddenItems).toContain('admin/analytics')
    })

    it('should not add duplicate hidden items', () => {
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.hiddenItems.filter((i) => i === 'admin/analytics').length).toBe(1)
    })

    it('should remove hidden item', () => {
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')
      useMenuCustomizationModalStore.getState().removeHiddenItem('admin/analytics')

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.hiddenItems).not.toContain('admin/analytics')
    })

    it('should clear all hidden items', () => {
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/reports')
      useMenuCustomizationModalStore.getState().clearHiddenItems()

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.hiddenItems.length).toBe(0)
    })

    it('should mark as dirty when adding hidden item', () => {
      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)
    })
  })

  describe('practice items mutations', () => {
    const customization: MenuCustomizationData = {
      sectionOrder: [],
      hiddenItems: [],
      practiceItems: [],
      bookmarks: [],
    }

    const mockPracticeItem: PracticeItem = {
      id: 'admin/bookings',
      name: 'Bookings',
      icon: 'Calendar',
      href: '/admin/bookings',
      order: 0,
      visible: true,
    }

    beforeEach(() => {
      useMenuCustomizationModalStore.getState().initializeDraft(customization)
    })

    it('should add practice item', () => {
      useMenuCustomizationModalStore.getState().addPracticeItem(mockPracticeItem)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.practiceItems).toContainEqual(mockPracticeItem)
    })

    it('should not add duplicate practice items', () => {
      useMenuCustomizationModalStore.getState().addPracticeItem(mockPracticeItem)
      useMenuCustomizationModalStore.getState().addPracticeItem(mockPracticeItem)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(
        draft?.practiceItems.filter((i) => i.id === mockPracticeItem.id).length
      ).toBe(1)
    })

    it('should set all practice items', () => {
      const items = [mockPracticeItem]
      useMenuCustomizationModalStore.getState().setPracticeItems(items)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.practiceItems).toEqual(items)
    })

    it('should update practice item', () => {
      useMenuCustomizationModalStore.getState().addPracticeItem(mockPracticeItem)
      useMenuCustomizationModalStore
        .getState()
        .updatePracticeItem(mockPracticeItem.id, { visible: false })

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      const updated = draft?.practiceItems.find((i) => i.id === mockPracticeItem.id)
      expect(updated?.visible).toBe(false)
    })

    it('should remove practice item', () => {
      useMenuCustomizationModalStore.getState().addPracticeItem(mockPracticeItem)
      useMenuCustomizationModalStore.getState().removePracticeItem(mockPracticeItem.id)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.practiceItems.some((i) => i.id === mockPracticeItem.id)).toBe(false)
    })

    it('should toggle practice item visibility', () => {
      useMenuCustomizationModalStore.getState().addPracticeItem(mockPracticeItem)
      expect(
        useMenuCustomizationModalStore
          .getState()
          .draftCustomization?.practiceItems[0].visible
      ).toBe(true)

      useMenuCustomizationModalStore
        .getState()
        .togglePracticeItemVisibility(mockPracticeItem.id)
      expect(
        useMenuCustomizationModalStore
          .getState()
          .draftCustomization?.practiceItems[0].visible
      ).toBe(false)

      useMenuCustomizationModalStore
        .getState()
        .togglePracticeItemVisibility(mockPracticeItem.id)
      expect(
        useMenuCustomizationModalStore
          .getState()
          .draftCustomization?.practiceItems[0].visible
      ).toBe(true)
    })

    it('should reorder practice items with correct order property', () => {
      const items = [
        { ...mockPracticeItem, id: 'item1', order: 0 },
        { ...mockPracticeItem, id: 'item2', order: 1 },
      ]

      useMenuCustomizationModalStore.getState().setPracticeItems(items)
      useMenuCustomizationModalStore
        .getState()
        .reorderPracticeItems([items[1], items[0]])

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.practiceItems[0].id).toBe('item2')
      expect(draft?.practiceItems[0].order).toBe(0)
      expect(draft?.practiceItems[1].id).toBe('item1')
      expect(draft?.practiceItems[1].order).toBe(1)
    })

    it('should mark as dirty when adding practice item', () => {
      useMenuCustomizationModalStore.getState().addPracticeItem(mockPracticeItem)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)
    })
  })

  describe('bookmarks mutations', () => {
    const customization: MenuCustomizationData = {
      sectionOrder: [],
      hiddenItems: [],
      practiceItems: [],
      bookmarks: [],
    }

    const mockBookmark: Bookmark = {
      id: 'admin/analytics',
      name: 'Analytics',
      icon: 'BarChart3',
      href: '/admin/analytics',
      order: 0,
    }

    beforeEach(() => {
      useMenuCustomizationModalStore.getState().initializeDraft(customization)
    })

    it('should add bookmark', () => {
      useMenuCustomizationModalStore.getState().addBookmark(mockBookmark)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.bookmarks).toContainEqual(mockBookmark)
    })

    it('should not add duplicate bookmarks', () => {
      useMenuCustomizationModalStore.getState().addBookmark(mockBookmark)
      useMenuCustomizationModalStore.getState().addBookmark(mockBookmark)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.bookmarks.filter((b) => b.id === mockBookmark.id).length).toBe(1)
    })

    it('should set all bookmarks', () => {
      const bookmarks = [mockBookmark]
      useMenuCustomizationModalStore.getState().setBookmarks(bookmarks)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.bookmarks).toEqual(bookmarks)
    })

    it('should update bookmark', () => {
      useMenuCustomizationModalStore.getState().addBookmark(mockBookmark)
      useMenuCustomizationModalStore
        .getState()
        .updateBookmark(mockBookmark.id, { name: 'Updated Analytics' })

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      const updated = draft?.bookmarks.find((b) => b.id === mockBookmark.id)
      expect(updated?.name).toBe('Updated Analytics')
    })

    it('should remove bookmark', () => {
      useMenuCustomizationModalStore.getState().addBookmark(mockBookmark)
      useMenuCustomizationModalStore.getState().removeBookmark(mockBookmark.id)

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.bookmarks.some((b) => b.id === mockBookmark.id)).toBe(false)
    })

    it('should reorder bookmarks with correct order property', () => {
      const bookmarks = [
        { ...mockBookmark, id: 'book1', order: 0 },
        { ...mockBookmark, id: 'book2', order: 1 },
      ]

      useMenuCustomizationModalStore.getState().setBookmarks(bookmarks)
      useMenuCustomizationModalStore
        .getState()
        .reorderBookmarks([bookmarks[1], bookmarks[0]])

      const draft = useMenuCustomizationModalStore.getState().draftCustomization
      expect(draft?.bookmarks[0].id).toBe('book2')
      expect(draft?.bookmarks[0].order).toBe(0)
      expect(draft?.bookmarks[1].id).toBe('book1')
      expect(draft?.bookmarks[1].order).toBe(1)
    })

    it('should mark as dirty when adding bookmark', () => {
      useMenuCustomizationModalStore.getState().addBookmark(mockBookmark)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)
    })
  })

  describe('getDraftData', () => {
    it('should return current draft customization', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)

      const data = useMenuCustomizationModalStore.getState().getDraftData()
      expect(data).toEqual(customization)
    })

    it('should return null if no draft', () => {
      const data = useMenuCustomizationModalStore.getState().getDraftData()
      expect(data).toBeNull()
    })
  })

  describe('reset', () => {
    it('should clear draft and isDirty', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      useMenuCustomizationModalStore
        .getState()
        .setSectionOrder(['business', 'dashboard'])

      useMenuCustomizationModalStore.getState().reset()

      const state = useMenuCustomizationModalStore.getState()
      expect(state.draftCustomization).toBeNull()
      expect(state.isDirty).toBe(false)
    })
  })

  describe('isDirty tracking', () => {
    it('should track changes across multiple operations', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)

      useMenuCustomizationModalStore.getState().addHiddenItem('admin/analytics')
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)

      useMenuCustomizationModalStore.getState().removeHiddenItem('admin/analytics')
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)
    })

    it('should be true when changes are made and false when reverted', () => {
      const customization: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      useMenuCustomizationModalStore.getState().initializeDraft(customization)
      useMenuCustomizationModalStore.getState().setSectionOrder(['business'])
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(true)

      useMenuCustomizationModalStore.getState().setSectionOrder(['dashboard'])
      expect(useMenuCustomizationModalStore.getState().isDirty).toBe(false)
    })
  })
})
