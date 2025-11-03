import { test, expect } from '@playwright/test'

async function devLoginAndSetCookie(page: any, request: any, baseURL: string | undefined, email: string) {
  const base = baseURL || process.env.E2E_BASE_URL || 'http://localhost:3000'
  const res = await request.post(`${base}/api/_dev/login`, { data: { email } })
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  const token = json.token as string
  const url = new URL(base)
  await page.context().addCookies([
    { name: '__Secure-next-auth.session-token', value: token, domain: url.hostname, path: '/', httpOnly: false, secure: false, sameSite: 'Lax' },
  ])
}

test.describe('Entities tab unified behavior', () => {
  test.beforeEach(async ({ page, request, baseURL }) => {
    await devLoginAndSetCookie(page, request, baseURL, 'admin@accountingfirm.com')
  })

  test('clients sub-tab shows list', async ({ page }) => {
    await page.goto('/admin/users?tab=entities&type=clients')
    await expect(page.getByRole('tab', { name: /clients/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('heading', { name: /client management/i })).toBeVisible({ timeout: 5000 })
  })

  test('team sub-tab shows team grid', async ({ page }) => {
    await page.goto('/admin/users?tab=entities&type=team')
    await expect(page.getByRole('tab', { name: /team/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/total members/i)).toBeVisible({ timeout: 5000 })
  })

  test('tabs visible in unified users page', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.getByRole('tab', { name: /entities/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /roles & permissions/i })).toBeVisible()
  })
})
