import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      task: {
        count: vi.fn(),
        groupBy: vi.fn(),
        findMany: vi.fn(),
      },
      complianceRecord: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
    },
  }
})

// Mock tenant utils and permissions
vi.mock('@/lib/tenant-utils', () => ({
  requireTenantContext: () => ({ userId: 'u1', role: 'ADMIN', tenantId: 't1' }),
}))

vi.mock('@/lib/permissions', () => ({
  hasPermission: () => true,
  PERMISSIONS: { ANALYTICS_VIEW: 'analytics_view' },
}))

vi.mock('@/lib/api-wrapper', () => ({
  withTenantContext: (fn: any) => fn,
}))

vi.mock('@/lib/api-response', () => ({
  respond: {
    forbidden: () => new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
  },
}))

vi.mock('@/lib/tenant', () => ({
  tenantFilter: (tenantId: string) => ({ tenantId }),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

describe('GET /api/admin/tasks/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns analytics data with proper tenant scoping', async () => {
    const now = new Date()
    const startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)

    ;(prisma.task.count as any)
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(6) // completed
      .mockResolvedValueOnce(5) // compliance total

    ;(prisma.task.groupBy as any)
      .mockResolvedValueOnce([
        { status: 'DONE', _count: { _all: 6 } },
        { status: 'TODO', _count: { _all: 4 } },
      ])
      .mockResolvedValueOnce([
        { priority: 'HIGH', _count: { _all: 3 } },
        { priority: 'MEDIUM', _count: { _all: 7 } },
      ])

    ;(prisma.task.findMany as any)
      .mockResolvedValueOnce([
        { createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), updatedAt: now },
      ]) // sample for avgAgeDays
      .mockResolvedValueOnce([
        { createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), updatedAt: now },
      ]) // created in last 7 days
      .mockResolvedValueOnce([
        { updatedAt: now },
      ]) // dones in last 7 days

    ;(prisma.complianceRecord.count as any)
      .mockResolvedValueOnce(3) // compliance completed

    ;(prisma.complianceRecord.findMany as any)
      .mockResolvedValueOnce([
        {
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          completedAt: now,
        },
      ]) // completed records for avgTimeToCompliance

    const req = new NextRequest('http://localhost:3000/api/admin/tasks/analytics')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.total).toBe(10)
    expect(json.completed).toBe(6)
    expect(json.compliance.complianceTotal).toBe(5)
    expect(json.compliance.complianceCompleted).toBe(3)
    expect(json.dailyTotals).toHaveLength(7)
    expect(json.dailyCompleted).toHaveLength(7)

    // Verify tenant filter was applied
    expect(prisma.task.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1' },
      })
    )
  })

  it('applies tenant filter to compliance record queries', async () => {
    const now = new Date()

    ;(prisma.task.count as any)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)

    ;(prisma.task.groupBy as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    ;(prisma.task.findMany as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    ;(prisma.complianceRecord.count as any).mockResolvedValueOnce(0)

    ;(prisma.complianceRecord.findMany as any).mockResolvedValueOnce([])

    const req = new NextRequest('http://localhost:3000/api/admin/tasks/analytics')
    await GET(req)

    // Verify complianceRecord.count includes tenant filter
    expect(prisma.complianceRecord.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 't1' }),
      })
    )

    // Verify complianceRecord.findMany includes tenant filter
    expect(prisma.complianceRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 't1' }),
      })
    )
  })

  it('handles empty analytics gracefully', async () => {
    ;(prisma.task.count as any)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)

    ;(prisma.task.groupBy as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    ;(prisma.task.findMany as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    ;(prisma.complianceRecord.count as any).mockResolvedValueOnce(0)

    ;(prisma.complianceRecord.findMany as any).mockResolvedValueOnce([])

    const req = new NextRequest('http://localhost:3000/api/admin/tasks/analytics')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.total).toBe(0)
    expect(json.compliance.complianceRate).toBe(0)
    expect(json.avgAgeDays).toBe(0)
  })

  it('logs errors and returns dev-friendly error details in development', async () => {
    const error = new Error('Database connection failed')
    ;(prisma.task.count as any).mockRejectedValueOnce(error)

    const req = new NextRequest('http://localhost:3000/api/admin/tasks/analytics')

    // Set NODE_ENV to development for this test
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    try {
      const res = await GET(req)
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.error).toBe('Failed to compute analytics')
      expect(json.details).toBe('Database connection failed')
      expect(json.stack).toBeDefined()

      expect(logger.error).toHaveBeenCalledWith(
        'Analytics computation failed',
        expect.objectContaining({
          errorName: 'Error',
          errorMessage: 'Database connection failed',
        }),
        error
      )
    } finally {
      process.env.NODE_ENV = originalEnv
    }
  })

  it('logs analytics computation info on success', async () => {
    const now = new Date()

    ;(prisma.task.count as any)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(5)

    ;(prisma.task.groupBy as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    ;(prisma.task.findMany as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    ;(prisma.complianceRecord.count as any).mockResolvedValueOnce(3)

    ;(prisma.complianceRecord.findMany as any).mockResolvedValueOnce([])

    const req = new NextRequest('http://localhost:3000/api/admin/tasks/analytics')
    await GET(req)

    expect(logger.info).toHaveBeenCalledWith(
      'Analytics computed successfully',
      expect.objectContaining({
        tenantId: 't1',
        userId: 'u1',
        taskCount: 10,
        complianceTotal: 5,
      })
    )
  })
})
