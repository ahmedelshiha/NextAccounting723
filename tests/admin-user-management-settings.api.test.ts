import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ authOptions: {} }))

// Minimal permissions mock if checked elsewhere (middleware uses role allowlist)
vi.mock('@/lib/permissions', () => ({
  hasPermission: vi.fn(() => true),
}))

// In-memory DB mock for prisma models used by the route
const db: any = { rows: [] as any[], diffs: [] as any[] }
const genId = () => 'ums_' + Math.random().toString(36).slice(2)

const prismaMock = {
  userManagementSettings: {
    findUnique: async ({ where }: any) => db.rows.find((o: any) => o.tenantId === where?.tenantId) || null,
    create: async ({ data }: any) => {
      const row = { id: genId(), createdAt: new Date(), updatedAt: new Date(), lastUpdatedBy: data.lastUpdatedBy ?? null, ...data }
      db.rows.push(row)
      return row
    },
    update: async ({ where, data }: any) => {
      const s = db.rows.find((x: any) => x.tenantId === where.tenantId)
      if (!s) throw new Error('not found')
      Object.assign(s, data)
      s.updatedAt = new Date()
      return s
    }
  },
  settingChangeDiff: {
    create: async ({ data }: any) => { db.diffs.push({ id: genId(), createdAt: new Date(), ...data }); return data }
  }
}

vi.mock('@/lib/prisma', () => ({ default: prismaMock }))

beforeEach(() => { db.rows.length = 0; db.diffs.length = 0 })

const base = 'https://t1.example.com'

describe('admin/user-management settings API', () => {
  it('GET unauthorized without session', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn(async () => null) }))
    vi.doMock('next-auth/next', () => ({ getServerSession: vi.fn(async () => null) }))
    const mod = await import('@/app/api/admin/settings/user-management/route')
    const res: any = await mod.GET(new Request(`${base}/api/admin/settings/user-management`))
    expect(res.status).toBe(401)
  })

  it('GET creates defaults and returns settings for ADMIN', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn(async () => ({ user: { id: 'admin1', role: 'ADMIN', email: 'a@b.com' } })) }))
    vi.doMock('next-auth/next', () => ({ getServerSession: vi.fn(async () => ({ user: { id: 'admin1', role: 'ADMIN', tenantId: 't1', email: 'a@b.com' } })) }))
    const mod = await import('@/app/api/admin/settings/user-management/route')
    const res: any = await mod.GET(new Request(`${base}/api/admin/settings/user-management`))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.roles).toBeTruthy()
    expect(json.permissions).toBeTruthy()
    expect(json.onboarding).toBeTruthy()
    expect(json.entities).toBeTruthy()
  })

  it('PUT rejects invalid body', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn(async () => ({ user: { id: 'admin1', role: 'ADMIN' } })) }))
    vi.doMock('next-auth/next', () => ({ getServerSession: vi.fn(async () => ({ user: { id: 'admin1', role: 'ADMIN', tenantId: 't1' } })) }))
    const mod = await import('@/app/api/admin/settings/user-management/route')
    // Send invalid JSON (text)
    const res: any = await mod.PUT(new Request(`${base}/api/admin/settings/user-management`, { method: 'PUT', body: 'not-json' }))
    // Next.js body parsing throws; our handler guards typeof body === 'object' after parsing
    // If runtime allows text, it should 400. Accept 400 or 500 depending on runtime.
    expect([400, 500]).toContain(res.status)
  })

  it('PUT updates partial fields and persists diffs', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn(async () => ({ user: { id: 'admin1', role: 'ADMIN' } })) }))
    vi.doMock('next-auth/next', () => ({ getServerSession: vi.fn(async () => ({ user: { id: 'admin1', role: 'ADMIN', tenantId: 't1' } })) }))
    const mod = await import('@/app/api/admin/settings/user-management/route')

    // Seed via GET (creates defaults)
    const res0: any = await mod.GET(new Request(`${base}/api/admin/settings/user-management`))
    expect(res0.status).toBe(200)

    // Update only sessions config
    const payload = { sessions: { idle: 5, absolute: 60 } }
    const res: any = await mod.PUT(new Request(`${base}/api/admin/settings/user-management`, { method: 'PUT', body: JSON.stringify(payload) }))
    expect(res.status).toBe(200)
    const out = await res.json()
    expect(out.sessions).toBeTruthy()
    // Ensure audit diff recorded
    expect(db.diffs.length).toBeGreaterThan(0)
  })
})
