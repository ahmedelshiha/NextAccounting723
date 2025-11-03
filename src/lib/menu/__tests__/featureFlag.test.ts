import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isMenuCustomizationEnabled,
  isMenuCustomizationEnabledForUser,
  getMenuCustomizationFeatureFlagConfig,
} from '../featureFlag'

describe('featureFlag', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED

  beforeEach(() => {
    process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = originalEnv
  })

  describe('isMenuCustomizationEnabled', () => {
    it('should return true when env var is "true"', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'true'
      const result = isMenuCustomizationEnabled()
      expect(result).toBe(true)
    })

    it('should return false when env var is "false"', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'false'
      const result = isMenuCustomizationEnabled()
      expect(result).toBe(false)
    })

    it('should return false when env var is not set', () => {
      delete process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED
      const result = isMenuCustomizationEnabled()
      expect(result).toBe(false)
    })

    it('should return false for invalid env var values', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'invalid'
      const result = isMenuCustomizationEnabled()
      expect(result).toBe(false)
    })

    it('should return false for case-sensitive comparison', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'True'
      const result = isMenuCustomizationEnabled()
      expect(result).toBe(false)
    })
  })

  describe('isMenuCustomizationEnabledForUser', () => {
    it('should return false when feature is disabled globally', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'false'
      const result = isMenuCustomizationEnabledForUser('user123')
      expect(result).toBe(false)
    })

    it('should return true when feature is enabled globally and user ID exists', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'true'
      const result = isMenuCustomizationEnabledForUser('user123')
      expect(result).toBe(true)
    })

    it('should return false when env var is not set', () => {
      delete process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED
      const result = isMenuCustomizationEnabledForUser('user123')
      expect(result).toBe(false)
    })

    it('should work with different user IDs', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'true'
      expect(isMenuCustomizationEnabledForUser('user1')).toBe(true)
      expect(isMenuCustomizationEnabledForUser('user2')).toBe(true)
      expect(isMenuCustomizationEnabledForUser('admin')).toBe(true)
    })

    it('should handle empty user ID', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'true'
      expect(isMenuCustomizationEnabledForUser('')).toBe(true)
    })
  })

  describe('getMenuCustomizationFeatureFlagConfig', () => {
    it('should return configuration object with required properties', () => {
      const config = getMenuCustomizationFeatureFlagConfig()
      expect(config).toHaveProperty('enabled')
      expect(config).toHaveProperty('rolloutPercentage')
      expect(config).toHaveProperty('targetUsers')
      expect(config).toHaveProperty('description')
    })

    it('should have correct enabled status based on env var', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'true'
      let config = getMenuCustomizationFeatureFlagConfig()
      expect(config.enabled).toBe(true)

      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'false'
      config = getMenuCustomizationFeatureFlagConfig()
      expect(config.enabled).toBe(false)
    })

    it('should have rollout percentage of 100', () => {
      const config = getMenuCustomizationFeatureFlagConfig()
      expect(config.rolloutPercentage).toBe(100)
    })

    it('should have targetUsers set to "all"', () => {
      const config = getMenuCustomizationFeatureFlagConfig()
      expect(config.targetUsers).toBe('all')
    })

    it('should have description string', () => {
      const config = getMenuCustomizationFeatureFlagConfig()
      expect(typeof config.description).toBe('string')
      expect(config.description.length).toBeGreaterThan(0)
    })

    it('should return consistent configuration on multiple calls', () => {
      const config1 = getMenuCustomizationFeatureFlagConfig()
      const config2 = getMenuCustomizationFeatureFlagConfig()

      expect(config1).toEqual(config2)
    })
  })

  describe('Feature flag integration', () => {
    it('should reflect changes in isMenuCustomizationEnabledForUser', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'true'
      const global = isMenuCustomizationEnabled()
      const forUser = isMenuCustomizationEnabledForUser('user123')

      if (global) {
        expect(forUser).toBe(true)
      }
    })

    it('should provide consistent information across functions', () => {
      process.env.NEXT_PUBLIC_MENU_CUSTOMIZATION_ENABLED = 'true'
      const enabled = isMenuCustomizationEnabled()
      const config = getMenuCustomizationFeatureFlagConfig()

      expect(config.enabled).toBe(enabled)
    })
  })
})
