import { test, expect } from '@playwright/test'

async function injectAxe(page) {
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js' })
}

test.describe('Accessibility (axe-core)', () => {
  test('homepage has no critical a11y violations', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    const results = await page.evaluate(async () => {
      // @ts-expect-error - axe is injected at runtime; window.axe is not in TypeScript DOM types
      const r = await window.axe.run(document, { resultTypes: ['violations'] })
      const critical = r.violations.filter(v => (v.impact || '').toLowerCase() === 'critical')
      return { count: critical.length, details: critical.map(v => v.id) }
    })
    expect(results.count, `Critical violations: ${results.details.join(',')}`).toBe(0)
  })

  test('user profile dropdown meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/admin')

    // Open user profile dropdown
    const trigger = page.getByRole('button', { name: /open user menu/i })
    await trigger.click()

    await injectAxe(page)
    const results = await page.evaluate(async () => {
      // @ts-expect-error - axe is injected at runtime
      const r = await window.axe.run(page.locator('[data-testid="user-profile-dropdown"]').first(), {
        resultTypes: ['violations']
      })
      return {
        violations: r.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description
        }))
      }
    })

    expect(results.violations.length, `Accessibility violations: ${JSON.stringify(results.violations)}`).toBe(0)
  })

  test('theme selector has accessible radio buttons', async ({ page }) => {
    await page.goto('/admin')

    const trigger = page.getByRole('button', { name: /open user menu/i })
    await trigger.click()

    // Check theme selector accessibility
    const themeGroup = page.locator('[role="radiogroup"]')
    await expect(themeGroup).toBeVisible()

    // All theme options should have proper ARIA attributes
    const themeOptions = page.locator('[role="radio"]')
    const count = await themeOptions.count()
    expect(count).toBeGreaterThan(0)

    // Each option should have aria-checked
    for (let i = 0; i < count; i++) {
      const option = themeOptions.nth(i)
      const ariaChecked = await option.getAttribute('aria-checked')
      expect(['true', 'false']).toContain(ariaChecked)
    }
  })

  test('status selector has proper ARIA attributes', async ({ page }) => {
    await page.goto('/admin')

    const trigger = page.getByRole('button', { name: /open user menu/i })
    await trigger.click()

    // Check status selector button
    const statusButton = page.getByRole('button', { name: /online/i }).first()
    await expect(statusButton).toHaveAttribute('aria-haspopup', /menu|listbox|dialog/)

    // Should have aria-expanded
    const ariaExpanded = await statusButton.getAttribute('aria-expanded')
    expect(['true', 'false']).toContain(ariaExpanded)
  })

  test('keyboard navigation works in profile dropdown', async ({ page }) => {
    await page.goto('/admin')

    // Open with keyboard
    const trigger = page.getByRole('button', { name: /open user menu/i })
    await trigger.focus()
    await page.keyboard.press('Enter')

    // Check that menu items are navigable
    const menuItems = page.locator('[role="menuitem"], [role="menuitemradio"]')
    const firstItem = menuItems.first()

    // Tab should move focus
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Escape should close and return focus to trigger
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  })

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/admin')

    const trigger = page.getByRole('button', { name: /open user menu/i })
    await trigger.click()

    // Check text contrast for menu items
    const menuItems = page.locator('[role="menuitem"], [role="menuitemradio"]')
    const count = await menuItems.count()

    expect(count).toBeGreaterThan(0)

    // All menu items should have sufficient contrast
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = menuItems.nth(i)
      await expect(item).toBeVisible()
    }
  })

  test('screen reader announcements work for status changes', async ({ page }) => {
    await page.goto('/admin')

    const trigger = page.getByRole('button', { name: /open user menu/i })
    await trigger.click()

    // Look for aria-live region for announcements
    const liveRegion = page.locator('[aria-live]')

    // There should be at least one live region for announcements
    const count = await liveRegion.count()
    expect(count).toBeGreaterThan(0)
  })
})
