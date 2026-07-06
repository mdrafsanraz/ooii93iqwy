import { unstable_cache, revalidateTag } from 'next/cache'
import { getDatabase } from './mongodb'
import type { Plan } from './plans'

export const PUBLIC_PLANS_CACHE_TAG = 'public-plans'

export interface WebsitePlan {
  type: 'artist' | 'label'
  name: string
  price: number
  period: string
  description: string
  features: string[]
  icon: string
  popular: boolean
  requiresPayment: boolean
  royaltyPercent: number
}

const FALLBACK_ARTIST: WebsitePlan = {
  type: 'artist',
  name: 'Artist',
  price: 0,
  period: 'year',
  description: 'Free for independent artists',
  features: [
    'Unlimited releases',
    '150+ platforms',
    '80% royalties',
    'Basic analytics',
    '48h release',
    'No credit card required',
  ],
  icon: '🎤',
  popular: true,
  requiresPayment: false,
  royaltyPercent: 80,
}

const FALLBACK_LABEL: WebsitePlan = {
  type: 'label',
  name: 'Label',
  price: 20,
  period: 'year',
  description: 'For labels & managers',
  features: [
    'Everything in Artist',
    'Multi-artist management',
    'Advanced analytics',
    'Priority support',
    '24h release',
  ],
  icon: '🏢',
  popular: true,
  requiresPayment: true,
  royaltyPercent: 100,
}

const FALLBACK_PLANS: WebsitePlan[] = [FALLBACK_ARTIST, FALLBACK_LABEL]

function toWebsitePlan(plan: Plan): WebsitePlan {
  return {
    type: plan.type,
    name: plan.name,
    price: plan.price,
    period: plan.period,
    description: plan.description,
    features: plan.features,
    icon: plan.icon,
    popular: plan.popular,
    requiresPayment: plan.requiresPayment,
    royaltyPercent: plan.royaltyPercent,
  }
}

async function fetchPublicPlansFromDb(): Promise<{
  plans: WebsitePlan[]
  trialEnabled: boolean
}> {
  const db = await getDatabase()
  const settings = await db.collection('settings').findOne({ settingsId: 'app_settings' })
  const artistSlug = settings?.activeArtistPlanSlug || 'artist_free'
  const labelSlug = settings?.activeLabelPlanSlug || 'label_20'
  const trialEnabled = settings?.trialEnabled ?? true

  const dbPlans = await db
    .collection<Plan>('plans')
    .find({ slug: { $in: [artistSlug, labelSlug] } })
    .sort({ type: 1, sortOrder: 1 })
    .toArray()

  const plans = dbPlans.length > 0 ? dbPlans.map(toWebsitePlan) : FALLBACK_PLANS
  return { plans, trialEnabled }
}

const getCachedPublicPlans = unstable_cache(
  fetchPublicPlansFromDb,
  ['public-plans-v1'],
  { tags: [PUBLIC_PLANS_CACHE_TAG], revalidate: 60 }
)

export function revalidatePublicPlansCache() {
  revalidateTag(PUBLIC_PLANS_CACHE_TAG)
}

export async function getPublicPlansData(): Promise<{
  plans: WebsitePlan[]
  trialEnabled: boolean
}> {
  try {
    return await getCachedPublicPlans()
  } catch (error) {
    console.error('getPublicPlansData error:', error)
    return { plans: FALLBACK_PLANS, trialEnabled: true }
  }
}

export function plansRecordFromList(
  items: WebsitePlan[]
): Record<'artist' | 'label', WebsitePlan> {
  const next: Record<'artist' | 'label', WebsitePlan> = {
    artist: FALLBACK_ARTIST,
    label: FALLBACK_LABEL,
  }
  for (const item of items) {
    if (item.type === 'artist' || item.type === 'label') {
      next[item.type] = item
    }
  }
  return next
}
