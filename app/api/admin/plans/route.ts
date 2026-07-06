import { NextRequest, NextResponse } from 'next/server'
import {
  getAllPlans,
  createPlan,
  updatePlan,
  setActivePlan,
  deletePlan,
  type PlanType,
} from '@/lib/plans'
import { getOrCreateStripePriceForPlan } from '@/lib/stripePlans'

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || !authHeader) return false

  const [type, credentials] = authHeader.split(' ')
  if (type !== 'Basic') return false

  try {
    const decoded = Buffer.from(credentials, 'base64').toString()
    const [, password] = decoded.split(':')
    return password === adminPassword
  } catch {
    return false
  }
}

function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split('\n').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const plans = await getAllPlans()
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Admin plans GET error:', error)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const type = body.type as PlanType
    if (!type || !['artist', 'label'].includes(type)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const price = Number(body.price)
    if (!body.name?.trim() || Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Name and valid price are required' }, { status: 400 })
    }

    const features = parseFeatures(body.features)
    if (features.length === 0) {
      return NextResponse.json({ error: 'At least one feature is required' }, { status: 400 })
    }

    const requiresPayment = body.requiresPayment ?? price > 0
    const plan = await createPlan({
      type,
      name: body.name.trim(),
      price,
      period: body.period?.trim() || 'year',
      description: body.description?.trim() || '',
      features,
      icon: body.icon?.trim() || (type === 'artist' ? '🎤' : '🏢'),
      popular: !!body.popular,
      requiresPayment,
      royaltyPercent: Number(body.royaltyPercent) || (price === 0 ? 80 : 100),
      sortOrder: Number(body.sortOrder) || 99,
    })

    if (requiresPayment && price > 0) {
      try {
        await getOrCreateStripePriceForPlan(plan)
      } catch (stripeError) {
        console.error('Stripe price creation failed for new plan:', stripeError)
      }
    }

    const savedPlans = await getAllPlans()
    const savedPlan = savedPlans.find((p) => p.id === plan.id) || plan

    return NextResponse.json({ success: true, plan: savedPlan })
  } catch (error) {
    console.error('Admin plans POST error:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, action } = body

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 })
    }

    if (action === 'activate') {
      const plan = await setActivePlan(id)
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      if (plan.requiresPayment && plan.price > 0) {
        try {
          await getOrCreateStripePriceForPlan(plan)
        } catch (stripeError) {
          console.error('Stripe price creation failed on activate:', stripeError)
          return NextResponse.json(
            { error: 'Plan activated but Stripe price could not be created. Check STRIPE_SECRET_KEY.' },
            { status: 500 }
          )
        }
      }

      const refreshed = (await getAllPlans()).find((p) => p.id === id) || plan
      return NextResponse.json({ success: true, plan: refreshed })
    }

    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) updates.name = String(body.name).trim()
    if (body.price !== undefined) updates.price = Number(body.price)
    if (body.period !== undefined) updates.period = String(body.period).trim()
    if (body.description !== undefined) updates.description = String(body.description).trim()
    if (body.features !== undefined) updates.features = parseFeatures(body.features)
    if (body.icon !== undefined) updates.icon = String(body.icon).trim()
    if (body.popular !== undefined) updates.popular = !!body.popular
    if (body.requiresPayment !== undefined) updates.requiresPayment = !!body.requiresPayment
    if (body.royaltyPercent !== undefined) updates.royaltyPercent = Number(body.royaltyPercent)
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder)

    const plan = await updatePlan(id, updates)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    console.error('Admin plans PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 })
    }

    const deleted = await deletePlan(id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Cannot delete active plan or plan not found' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin plans DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
