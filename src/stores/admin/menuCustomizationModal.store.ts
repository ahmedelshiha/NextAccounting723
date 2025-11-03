/**
 * Menu Customization Modal Store (Zustand)
 *
 * Manages the draft state within the modal, separate from the global store.
 * This allows users to make changes, cancel, or save them without affecting
 * the actual application state until explicitly saved.
 *
 * Provides computed properties like isDirty to determine if changes have been made.
 */

import { create } from 'zustand'
import {
  MenuCustomizationData,
  PracticeItem,
  Bookmark,
} from '@/types/admin/menuCustomization'

/**
 * Modal store state and actions
 */
interface MenuCustomizationModalStore {
  // State
  draftCustomization: MenuCustomizationData | null

  // Computed
  isDirty: boolean

  // Actions
  initializeDraft: (customization: MenuCustomizationData) => void
  clearDraft: () => void

  // Section order mutations
  setSectionOrder: (order: string[]) => void

  // Hidden items mutations
  addHiddenItem: (itemPath: string) => void
  removeHiddenItem: (itemPath: string) => void
  clearHiddenItems: () => void

  // Practice items mutations
  setPracticeItems: (items: PracticeItem[]) => void
  addPracticeItem: (item: PracticeItem) => void
  updatePracticeItem: (id: string, updates: Partial<PracticeItem>) => void
  removePracticeItem: (id: string) => void
  reorderPracticeItems: (items: PracticeItem[]) => void
  togglePracticeItemVisibility: (id: string) => void

  // Bookmarks mutations
  setBookmarks: (bookmarks: Bookmark[]) => void
  addBookmark: (bookmark: Bookmark) => void
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void
  removeBookmark: (id: string) => void
  reorderBookmarks: (bookmarks: Bookmark[]) => void

  // Utility
  getDraftData: () => MenuCustomizationData | null
  reset: () => void
}

/**
 * Create the modal store with computed isDirty property
 */
export const useMenuCustomizationModalStore = create<MenuCustomizationModalStore>(
  (set, get) => {
    // Helper to compute isDirty
    const computeIsDirty = (original: MenuCustomizationData | null, draft: MenuCustomizationData | null): boolean => {
      if (!original || !draft) return false

      // Deep comparison of all properties
      return (
        JSON.stringify(original.sectionOrder) !== JSON.stringify(draft.sectionOrder) ||
        JSON.stringify(original.hiddenItems) !== JSON.stringify(draft.hiddenItems) ||
        JSON.stringify(original.practiceItems) !== JSON.stringify(draft.practiceItems) ||
        JSON.stringify(original.bookmarks) !== JSON.stringify(draft.bookmarks)
      )
    }

    // Store the original for dirty detection
    let original: MenuCustomizationData | null = null

    return {
      // Initial state
      draftCustomization: null,
      isDirty: false,

      /**
       * Initialize the draft with the current customization
       * Called when the modal is opened
       */
      initializeDraft: (customization: MenuCustomizationData) => {
        original = JSON.parse(JSON.stringify(customization))
        set({
          draftCustomization: JSON.parse(JSON.stringify(customization)),
          isDirty: false,
        })
      },

      /**
       * Clear the draft (usually on cancel)
       */
      clearDraft: () => {
        set({ draftCustomization: null, isDirty: false })
        original = null
      },

      /**
       * Update section order
       */
      setSectionOrder: (order: string[]) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = { ...draft, sectionOrder: order }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Add a hidden item
       */
      addHiddenItem: (itemPath: string) => {
        const draft = get().draftCustomization
        if (!draft) return

        if (!draft.hiddenItems.includes(itemPath)) {
          const updated = {
            ...draft,
            hiddenItems: [...draft.hiddenItems, itemPath],
          }
          set({
            draftCustomization: updated,
            isDirty: computeIsDirty(original, updated),
          })
        }
      },

      /**
       * Remove a hidden item
       */
      removeHiddenItem: (itemPath: string) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          hiddenItems: draft.hiddenItems.filter((item) => item !== itemPath),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Clear all hidden items
       */
      clearHiddenItems: () => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = { ...draft, hiddenItems: [] }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Set all practice items
       */
      setPracticeItems: (items: PracticeItem[]) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = { ...draft, practiceItems: items }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Add a practice item
       */
      addPracticeItem: (item: PracticeItem) => {
        const draft = get().draftCustomization
        if (!draft) return

        const itemExists = draft.practiceItems.some((p) => p.id === item.id)
        if (!itemExists) {
          const updated = {
            ...draft,
            practiceItems: [...draft.practiceItems, item],
          }
          set({
            draftCustomization: updated,
            isDirty: computeIsDirty(original, updated),
          })
        }
      },

      /**
       * Update a practice item
       */
      updatePracticeItem: (id: string, updates: Partial<PracticeItem>) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          practiceItems: draft.practiceItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Remove a practice item
       */
      removePracticeItem: (id: string) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          practiceItems: draft.practiceItems.filter((item) => item.id !== id),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Reorder practice items (for drag-and-drop)
       */
      reorderPracticeItems: (items: PracticeItem[]) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          practiceItems: items.map((item, index) => ({
            ...item,
            order: index,
          })),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Toggle visibility of a practice item
       */
      togglePracticeItemVisibility: (id: string) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          practiceItems: draft.practiceItems.map((item) =>
            item.id === id ? { ...item, visible: !item.visible } : item
          ),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Set all bookmarks
       */
      setBookmarks: (bookmarks: Bookmark[]) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = { ...draft, bookmarks }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Add a bookmark
       */
      addBookmark: (bookmark: Bookmark) => {
        const draft = get().draftCustomization
        if (!draft) return

        const bookmarkExists = draft.bookmarks.some((b) => b.id === bookmark.id)
        if (!bookmarkExists) {
          const updated = {
            ...draft,
            bookmarks: [...draft.bookmarks, bookmark],
          }
          set({
            draftCustomization: updated,
            isDirty: computeIsDirty(original, updated),
          })
        }
      },

      /**
       * Update a bookmark
       */
      updateBookmark: (id: string, updates: Partial<Bookmark>) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          bookmarks: draft.bookmarks.map((bookmark) =>
            bookmark.id === id ? { ...bookmark, ...updates } : bookmark
          ),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Remove a bookmark
       */
      removeBookmark: (id: string) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          bookmarks: draft.bookmarks.filter((bookmark) => bookmark.id !== id),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Reorder bookmarks (for drag-and-drop)
       */
      reorderBookmarks: (bookmarks: Bookmark[]) => {
        const draft = get().draftCustomization
        if (!draft) return

        const updated = {
          ...draft,
          bookmarks: bookmarks.map((bookmark, index) => ({
            ...bookmark,
            order: index,
          })),
        }
        set({
          draftCustomization: updated,
          isDirty: computeIsDirty(original, updated),
        })
      },

      /**
       * Get the current draft data
       */
      getDraftData: () => {
        return get().draftCustomization
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set({ draftCustomization: null, isDirty: false })
        original = null
      },
    }
  }
)
