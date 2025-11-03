import { describe, it, expect } from 'vitest'
import {
  validateMenuCustomization,
  sanitizeMenuCustomization,
} from '../menuValidator'
import { MenuCustomizationData } from '@/types/admin/menuCustomization'

describe('menuValidator', () => {
  describe('validateMenuCustomization', () => {
    it('should accept valid customization data', () => {
      const valid: MenuCustomizationData = {
        sectionOrder: ['dashboard', 'business', 'financial', 'operations', 'system'],
        hiddenItems: ['admin/analytics'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = validateMenuCustomization(valid)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid section IDs', () => {
      const invalid: MenuCustomizationData = {
        sectionOrder: ['invalid-section'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const result = validateMenuCustomization(invalid)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject non-array sectionOrder', () => {
      const invalid = {
        sectionOrder: 'not-an-array',
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const result = validateMenuCustomization(invalid as any)
      expect(result.isValid).toBe(false)
    })

    it('should reject invalid hidden item paths', () => {
      const invalid: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: ['invalid/path'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = validateMenuCustomization(invalid)
      expect(result.isValid).toBe(false)
    })

    it('should accept valid hidden item paths', () => {
      const valid: MenuCustomizationData = {
        sectionOrder: ['dashboard'],
        hiddenItems: ['admin/analytics', 'admin/reports'],
        practiceItems: [],
        bookmarks: [],
      }

      const result = validateMenuCustomization(valid)
      expect(result.isValid).toBe(true)
    })

    it('should enforce array size limits', () => {
      const invalid: MenuCustomizationData = {
        sectionOrder: Array(11).fill('dashboard'),
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      }

      const result = validateMenuCustomization(invalid)
      expect(result.isValid).toBe(false)
    })
  })

  describe('sanitizeMenuCustomization', () => {
    it('should return clean data with only required fields', () => {
      const data: any = {
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
        extraField: 'should-be-removed',
      }

      const sanitized = sanitizeMenuCustomization(data)
      expect(sanitized).toEqual({
        sectionOrder: ['dashboard'],
        hiddenItems: [],
        practiceItems: [],
        bookmarks: [],
      })
      expect((sanitized as any).extraField).toBeUndefined()
    })

    it('should convert non-array fields to empty arrays', () => {
      const data: any = {
        sectionOrder: null,
        hiddenItems: undefined,
        practiceItems: 'not-array',
        bookmarks: {},
      }

      const sanitized = sanitizeMenuCustomization(data)
      expect(Array.isArray(sanitized.sectionOrder)).toBe(true)
      expect(Array.isArray(sanitized.hiddenItems)).toBe(true)
      expect(Array.isArray(sanitized.practiceItems)).toBe(true)
      expect(Array.isArray(sanitized.bookmarks)).toBe(true)
    })
  })
})
