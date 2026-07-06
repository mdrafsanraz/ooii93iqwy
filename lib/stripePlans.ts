import Stripe from 'stripe'
import { getDatabase } from './mongodb'
import type { Plan } from './plans'

const PLANS_COLLECTION = 'plans'

export async function getOrCreateStripePriceForPlan(plan: Plan): Promise<string | null> {
  if (!plan.requiresPayment || plan.price <= 0) {
    return null
  }

  if (plan.stripePriceId) {
    return plan.stripePriceId
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  })

  const product = await stripe.products.create({
    name: `RDistro ${plan.name}`,
    description: plan.description || `${plan.name} plan - $${plan.price}/${plan.period}`,
    metadata: {
      planId: plan.id,
      planType: plan.type,
    },
  })

  const interval = plan.period === 'month' ? 'month' : 'year'
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(plan.price * 100),
    currency: 'usd',
    recurring: { interval },
    metadata: {
      planId: plan.id,
      planType: plan.type,
    },
  })

  const db = await getDatabase()
  await db.collection(PLANS_COLLECTION).updateOne(
    { id: plan.id },
    {
      $set: {
        stripePriceId: price.id,
        stripeProductId: product.id,
        updatedAt: new Date().toISOString(),
      },
    }
  )

  return price.id
}
