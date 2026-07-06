import { NextRequest, NextResponse } from 'next/server'
import { getAllPlans, setActivePlan, updatePlanStripePrice } from '@/lib/plans'
import { revalidatePublicPlansCache } from '@/lib/publicPlans'
import { getStripePriceIdForPlan } from '@/lib/stripePlans'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    const { id, action, stripePriceId } = body

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 })
    }

    if (action === 'set_stripe_price') {
      if (!stripePriceId?.trim()) {
        return NextResponse.json({ error: 'Stripe Price ID is required' }, { status: 400 })
      }
      try {
        const plan = await updatePlanStripePrice(id, stripePriceId)
        if (!plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }
        revalidatePublicPlansCache()
        return NextResponse.json({ success: true, plan })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid Stripe Price ID'
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    if (action === 'activate') {
      const allPlans = await getAllPlans()
      const target = allPlans.find((p) => p.id === id)
      if (!target) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      if (target.requiresPayment && target.price > 0 && !getStripePriceIdForPlan(target)) {
        return NextResponse.json(
          {
            error: `Add a Stripe Price ID for ${target.slug} before activating this paid plan.`,
          },
          { status: 400 }
        )
      }

      const plan = await setActivePlan(id)
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      const refreshed = (await getAllPlans()).find((p) => p.id === plan.id) || plan
      revalidatePublicPlansCache()
      return NextResponse.json({ success: true, plan: refreshed })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin plans PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}
