import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const GET = withTenantContext(async () => {
  try {
    const ctx = requireTenantContext()
    const role = ctx.role ?? undefined
    if (!hasPermission(role, PERMISSIONS.USERS_VIEW)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!ctx.tenantId) {
      return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 })
    }

    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        tenantId: ctx.tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ clients })
  } catch (err) {
    console.error('GET /api/admin/entities/clients error', err)
    return NextResponse.json({ error: 'Failed to list clients' }, { status: 500 })
  }
})

export const POST = withTenantContext(async (req: Request) => {
  try {
    const ctx = requireTenantContext()
    const role = ctx.role ?? undefined
    if (!hasPermission(role, PERMISSIONS.USERS_MANAGE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!ctx.tenantId) {
      return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { name, email, tier, status } = body || {}

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: ctx.tenantId, email } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const client = await prisma.user.create({
      data: {
        name,
        email,
        role: 'CLIENT',
        tenantId: ctx.tenantId,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/entities/clients error', err)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
})
