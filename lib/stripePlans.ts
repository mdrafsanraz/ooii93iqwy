import type { Plan } from './plans'

const ENV_PRICE_BY_SLUG: Record<string, string | undefined> = {
  artist_5: process.env.STRIPE_PRICE_ARTIST_5,
  artist_10: process.env.STRIPE_PRICE_ARTIST_10,
  label_20: process.env.STRIPE_PRICE_LABEL_20,
  label_50: process.env.STRIPE_PRICE_LABEL_50,
}

function envFallbackForPlan(plan: Plan): string | undefined {
  if (plan.slug && ENV_PRICE_BY_SLUG[plan.slug]) {
    return ENV_PRICE_BY_SLUG[plan.slug]
  }
  if (plan.type === 'artist' && process.env.STRIPE_ARTIST_PRICE_ID) {
    return process.env.STRIPE_ARTIST_PRICE_ID
  }
  if (plan.type === 'label' && process.env.STRIPE_LABEL_PRICE_ID) {
    return process.env.STRIPE_LABEL_PRICE_ID
  }
  return undefined
}

export function getStripePriceIdForPlan(plan: Plan): string | null {
  if (!plan.requiresPayment || plan.price <= 0) {
    return null
  }

  const priceId = plan.stripePriceId?.trim() || envFallbackForPlan(plan)?.trim()
  return priceId || null
}

export function requireStripePriceIdForPlan(plan: Plan): string {
  const priceId = getStripePriceIdForPlan(plan)
  if (!priceId) {
    throw new Error(
      `Stripe Price ID missing for ${plan.slug || plan.name}. Add it in Admin → Stripe Price IDs or set env STRIPE_PRICE_${(plan.slug || '').toUpperCase()}.`
    )
  }
  if (!priceId.startsWith('price_')) {
    throw new Error('Stripe Price ID must start with price_')
  }
  return priceId
}
