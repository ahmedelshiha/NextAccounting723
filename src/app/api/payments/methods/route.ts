import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantFromRequest } from '@/lib/tenant'
import { logAuditSafe } from '@/lib/observability-helpers'
import { z } from 'zod'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
})

const AddPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1), // Stripe payment method ID
  setAsDefault: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getTenantFromRequest(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
    }

    // Fetch user's payment methods
    const paymentMethods = await prisma.userPaymentMethod.findMany({
      where: {
        userId: session.user.id,
        tenantId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        type: true,
        isDefault: true,
        last4: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    await logAuditSafe({
      action: 'payment_methods:list',
      details: {
        count: paymentMethods.length,
      },
    }).catch(() => {})

    return NextResponse.json(
      {
        paymentMethods,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Payment methods list API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getTenantFromRequest(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
    }

    const body = await request.json()
    const validated = AddPaymentMethodSchema.parse(body)

    // Verify payment method exists in Stripe
    let stripePaymentMethod: Stripe.PaymentMethod
    try {
      stripePaymentMethod = await stripe.paymentMethods.retrieve(
        validated.paymentMethodId
      )
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid payment method ID' },
        { status: 400 }
      )
    }

    // Check for duplicate
    const existing = await prisma.userPaymentMethod.findFirst({
      where: {
        userId: session.user.id,
        paymentMethodId: validated.paymentMethodId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This payment method is already saved' },
        { status: 409 }
      )
    }

    // If setting as default, unset previous default
    if (validated.setAsDefault) {
      await prisma.userPaymentMethod.updateMany({
        where: {
          userId: session.user.id,
          tenantId,
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    // Extract payment method details
    let last4 = ''
    let brand = ''
    let expiryMonth: number | undefined
    let expiryYear: number | undefined

    if (stripePaymentMethod.card) {
      last4 = stripePaymentMethod.card.last4
      brand = stripePaymentMethod.card.brand
      expiryMonth = stripePaymentMethod.card.exp_month
      expiryYear = stripePaymentMethod.card.exp_year
    } else if (stripePaymentMethod.us_bank_account) {
      last4 = stripePaymentMethod.us_bank_account.last4
      brand = 'bank_account'
    }

    // Save payment method
    const paymentMethod = await prisma.userPaymentMethod.create({
      data: {
        userId: session.user.id,
        tenantId,
        paymentMethodId: validated.paymentMethodId,
        type: stripePaymentMethod.type,
        isDefault: validated.setAsDefault,
        last4,
        brand,
        expiryMonth,
        expiryYear,
        fingerprint: `${stripePaymentMethod.id}_${Date.now()}`.substring(0, 255),
      },
      select: {
        id: true,
        type: true,
        isDefault: true,
        last4: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        createdAt: true,
      },
    })

    await logAuditSafe({
      action: 'payment_methods:add',
      details: {
        paymentMethodId: validated.paymentMethodId,
        type: stripePaymentMethod.type,
        last4,
      },
    }).catch(() => {})

    return NextResponse.json(paymentMethod, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Payment methods add API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
