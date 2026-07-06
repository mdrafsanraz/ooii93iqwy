import { NextRequest, NextResponse } from 'next/server'
import { getAllPlans, setActivePlan } from '@/lib/plans'
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

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || action !== 'activate') {
      return NextResponse.json({ error: 'Plan id and activate action required' }, { status: 400 })
    }

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

    const refreshed = (await getAllPlans()).find((p) => p.id === plan.id) || plan
    return NextResponse.json({ success: true, plan: refreshed })
  } catch (error) {
    console.error('Admin plans PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}
