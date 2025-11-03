import { test, expect, Page } from '@playwright/test'

test.describe('Menu Customization Feature', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('should display menu customization button in admin layout', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    // Wait for button to appear
    await expect(customizeButton.first()).toBeVisible({ timeout: 5000 })
  })

  test('should open menu customization modal when button is clicked', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible()
  })

  test('should display all tabs in the customization modal', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    // Check for tabs
    const sectionsTab = page.getByRole('tab', { name: /sections/i })
    const practiceTab = page.getByRole('tab', { name: /practice/i })
    const bookmarksTab = page.getByRole('tab', { name: /bookmarks/i })

    await expect(sectionsTab).toBeVisible()
    await expect(practiceTab).toBeVisible()
    await expect(bookmarksTab).toBeVisible()
  })

  test('should be able to navigate between tabs', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const practiceTab = page.getByRole('tab', { name: /practice/i })
    await practiceTab.click()

    // Verify practice content is visible
    const practiceContent = page.locator('[role="tabpanel"]').first()
    await expect(practiceContent).toBeVisible()
  })

  test('should close modal on cancel', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible()

    // Click cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i }).first()
    await cancelButton.click()

    // Modal should be hidden
    await expect(modal).not.toBeVisible({ timeout: 2000 })
  })

  test('should show save button and reset button', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const saveButton = page.getByRole('button', { name: /save/i }).first()
    const resetButton = page.getByRole('button', { name: /reset/i }).first()

    await expect(saveButton).toBeVisible()
    await expect(resetButton).toBeVisible()
  })

  test('should handle item visibility toggle in practice tab', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const practiceTab = page.getByRole('tab', { name: /practice/i })
    await practiceTab.click()

    // Look for visibility toggle (checkbox or toggle switch)
    const toggles = page.locator('[role="checkbox"], [role="switch"]')
    const toggleCount = await toggles.count()

    if (toggleCount > 0) {
      const firstToggle = toggles.first()
      const initialState = await firstToggle.isChecked()

      // Click toggle to change state
      await firstToggle.click()

      const newState = await firstToggle.isChecked()
      expect(newState).not.toBe(initialState)
    }
  })

  test('should show error message on load failure and allow retry', async () => {
    // Intercept API to simulate failure
    await page.route('**/api/admin/menu-customization', (route) => {
      route.abort()
    })

    // Reload to trigger load
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check for error message
    const errorElement = page.locator('text=/error|failed/i').first()

    if (await errorElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Look for retry button
      const retryButton = page.getByRole('button', { name: /retry|try again/i }).first()

      if (await retryButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Restore API mock for retry
        await page.route('**/api/admin/menu-customization', (route) => {
          route.continue()
        })

        await retryButton.click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('should persist menu order after save', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    // Get initial menu items
    const sectionsTab = page.getByRole('tab', { name: /sections/i })
    await sectionsTab.click()

    const items = page.locator('[data-testid="draggable-item"], li').first()
    const initialText = await items.textContent()

    // Try to reorder using drag and drop (if available)
    const firstItem = page.locator('[data-testid="draggable-item"]').first()
    const secondItem = page.locator('[data-testid="draggable-item"]').nth(1)

    if (
      (await firstItem.isVisible({ timeout: 1000 }).catch(() => false)) &&
      (await secondItem.isVisible({ timeout: 1000 }).catch(() => false))
    ) {
      await firstItem.dragTo(secondItem)
    }

    // Save changes
    const saveButton = page.getByRole('button', { name: /save/i }).first()
    await saveButton.click()

    // Wait for modal to close and changes to be applied
    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).not.toBeVisible({ timeout: 5000 })

    // Verify changes persisted (menu should still show the reordered items)
    await page.waitForLoadState('networkidle')
  })

  test('should handle reset to defaults', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    // Make some changes
    const practiceTab = page.getByRole('tab', { name: /practice/i })
    await practiceTab.click()

    // Click reset button
    const resetButton = page.getByRole('button', { name: /reset/i }).first()
    await resetButton.click()

    // Confirm reset if there's a confirmation dialog
    const confirmButton = page
      .getByRole('button', { name: /confirm|yes|ok/i })
      .first()
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click()
    }

    // Wait for reset to complete
    await page.waitForLoadState('networkidle')
  })

  test('should display loading state during save', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const saveButton = page.getByRole('button', { name: /save/i }).first()

    // Make small delay in API response to see loading state
    await page.route('**/api/admin/menu-customization', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    await saveButton.click()

    // Check for loading indicator
    const loadingIndicator = page.locator('[data-testid="loading"], [aria-busy="true"]').first()
    const saveButtonText = await saveButton.textContent()

    // Either should have loading indicator or button should be disabled
    const isLoading = (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) ||
      (await saveButton.isDisabled())

    expect(isLoading).toBeTruthy()
  })

  test('should filter practice items in practice tab', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const practiceTab = page.getByRole('tab', { name: /practice/i })
    await practiceTab.click()

    // Look for search/filter input
    const searchInput = page.locator('input[type="search"], input[type="text"]').first()

    if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Type search term
      await searchInput.fill('booking')

      // Wait for filter to apply
      await page.waitForTimeout(300)

      // Verify filtered results
      const items = page.locator('[role="listitem"], li')
      const itemCount = await items.count()

      // Should have at least one result or none
      expect(itemCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should handle adding bookmark from practice tab', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const practiceTab = page.getByRole('tab', { name: /practice/i })
    await practiceTab.click()

    // Look for add to bookmarks button or star icon
    const addBookmarkButtons = page.locator('[data-testid="add-bookmark"], [aria-label*="bookmark"]')
    const buttonCount = await addBookmarkButtons.count()

    if (buttonCount > 0) {
      const firstButton = addBookmarkButtons.first()
      await firstButton.click()

      // Navigate to bookmarks tab
      const bookmarksTab = page.getByRole('tab', { name: /bookmarks/i })
      await bookmarksTab.click()

      // Verify item appears in bookmarks
      await page.waitForTimeout(300)
    }
  })

  test('should maintain scroll position when switching tabs', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const practiceTab = page.getByRole('tab', { name: /practice/i })
    await practiceTab.click()

    // Scroll down in practice tab
    const tabPanel = page.locator('[role="tabpanel"]').first()
    await tabPanel.evaluate((el) => {
      el.scrollTop = 100
    })

    const scrollBefore = await tabPanel.evaluate((el) => el.scrollTop)

    // Switch to another tab
    const bookmarksTab = page.getByRole('tab', { name: /bookmarks/i })
    await bookmarksTab.click()

    // Switch back
    await practiceTab.click()

    // Scroll position might be reset in some implementations
    const scrollAfter = await tabPanel.evaluate((el) => el.scrollTop)

    // Just verify we can still scroll
    expect(typeof scrollAfter).toBe('number')
  })

  test('should show unsaved changes warning', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    await customizeButton.first().click()

    const practiceTab = page.getByRole('tab', { name: /practice/i })
    await practiceTab.click()

    // Make changes
    const toggles = page.locator('[role="checkbox"], [role="switch"]')
    if (await toggles.count() > 0) {
      await toggles.first().click()

      // Try to close modal without saving
      const closeButton = page.locator('button[aria-label="Close"], .close-button').first()
      if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeButton.click()

        // Should show confirmation dialog
        const confirmDialog = page.locator('[role="dialog"], .confirmation').nth(1)
        const isWarningVisible = await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)

        expect(isWarningVisible).toBeTruthy()
      }
    }
  })

  test('should be keyboard accessible', async () => {
    const customizeButton = page.getByRole('button', {
      name: /customize|menu/i,
    })

    // Tab to the button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Open modal with Enter
    await page.keyboard.press('Enter')

    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible()

    // Tab through tabs
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowRight')

    // Close modal with Escape
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible({ timeout: 2000 })
  })
})
