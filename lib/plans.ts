import { getDatabase } from './mongodb'

export type PlanType = 'artist' | 'label'

export interface Plan {
  id: string
  slug: string
  type: PlanType
  name: string
  price: number
  period: string
  description: string
  features: string[]
  icon: string
  popular: boolean
  isActive: boolean
  requiresPayment: boolean
  royaltyPercent: number
  sortOrder: number
  stripePriceId?: string
  stripeProductId?: string
  createdAt: string
  updatedAt: string
}

const PLANS_COLLECTION = 'plans'

type PresetPlan = Omit<Plan, 'createdAt' | 'updatedAt' | 'isActive'>

const PRESET_PLANS: PresetPlan[] = [
  {
    id: 'artist_free',
    slug: 'artist_free',
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
    sortOrder: 0,
  },
  {
    id: 'artist_5',
    slug: 'artist_5',
    type: 'artist',
    name: 'Artist',
    price: 5,
    period: 'year',
    description: 'Paid Artist plan',
    features: [
      'Unlimited releases',
      '150+ platforms',
      '100% royalties',
      'Basic analytics',
      '48h release',
    ],
    icon: '🎤',
    popular: false,
    requiresPayment: true,
    royaltyPercent: 100,
    sortOrder: 1,
  },
  {
    id: 'artist_10',
    slug: 'artist_10',
    type: 'artist',
    name: 'Artist',
    price: 10,
    period: 'year',
    description: 'Paid Artist plan',
    features: [
      'Unlimited releases',
      '150+ platforms',
      '100% royalties',
      'Basic analytics',
      '48h release',
    ],
    icon: '🎤',
    popular: false,
    requiresPayment: true,
    royaltyPercent: 100,
    sortOrder: 2,
  },
  {
    id: 'label_20',
    slug: 'label_20',
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
    sortOrder: 0,
  },
  {
    id: 'label_50',
    slug: 'label_50',
    type: 'label',
    name: 'Label',
    price: 50,
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
    popular: false,
    requiresPayment: true,
    royaltyPercent: 100,
    sortOrder: 1,
  },
]

export async function ensurePresetPlans(): Promise<void> {
  const db = await getDatabase()
  const now = new Date().toISOString()

  for (const preset of PRESET_PLANS) {
    const bySlug = await db.collection<Plan>(PLANS_COLLECTION).findOne({ slug: preset.slug })
    if (bySlug) continue

    const byPrice = await db.collection<Plan>(PLANS_COLLECTION).findOne({
      type: preset.type,
      price: preset.price,
      slug: { $exists: false },
    })

    if (byPrice) {
      await db.collection(PLANS_COLLECTION).updateOne(
        { id: byPrice.id },
        {
          $set: {
            slug: preset.slug,
            name: preset.name,
            description: preset.description,
            features: preset.features,
            requiresPayment: preset.requiresPayment,
            royaltyPercent: preset.royaltyPercent,
            sortOrder: preset.sortOrder,
            updatedAt: now,
          },
        }
      )
      continue
    }

    const defaultActive = preset.slug === 'artist_free' || preset.slug === 'label_20'
    await db.collection(PLANS_COLLECTION).insertOne({
      ...preset,
      isActive: defaultActive,
      createdAt: now,
      updatedAt: now,
    })
  }

  for (const type of ['artist', 'label'] as PlanType[]) {
    const active = await db.collection<Plan>(PLANS_COLLECTION).findOne({
      type,
      isActive: true,
      slug: { $in: PRESET_PLANS.map((p) => p.slug) },
    })
    if (!active) {
      const fallbackSlug = type === 'artist' ? 'artist_free' : 'label_20'
      await setActivePlan(fallbackSlug)
    }
  }

  await db.collection(PLANS_COLLECTION).updateMany(
    { slug: { $nin: PRESET_PLANS.map((p) => p.slug) } },
    { $set: { isActive: false, updatedAt: now } }
  )
}

/** @deprecated use ensurePresetPlans */
export async function ensureDefaultPlans(): Promise<void> {
  return ensurePresetPlans()
}

export async function getAllPlans(): Promise<Plan[]> {
  await ensurePresetPlans()
  const db = await getDatabase()
  return db
    .collection<Plan>(PLANS_COLLECTION)
    .find({ slug: { $in: PRESET_PLANS.map((p) => p.slug) } })
    .sort({ type: 1, sortOrder: 1 })
    .toArray()
}

export async function getActivePlans(): Promise<Plan[]> {
  await ensurePresetPlans()
  const db = await getDatabase()
  return db
    .collection<Plan>(PLANS_COLLECTION)
    .find({ isActive: true, slug: { $in: PRESET_PLANS.map((p) => p.slug) } })
    .sort({ type: 1, sortOrder: 1 })
    .toArray()
}

export async function getActivePlan(type: PlanType): Promise<Plan | null> {
  await ensurePresetPlans()
  const db = await getDatabase()
  const presetSlugs = PRESET_PLANS.map((p) => p.slug)
  return db.collection<Plan>(PLANS_COLLECTION).findOne({
    type,
    isActive: true,
    slug: { $in: presetSlugs },
  })
}

export async function setActivePlan(idOrSlug: string): Promise<Plan | null> {
  const db = await getDatabase()
  const plan =
    (await db.collection<Plan>(PLANS_COLLECTION).findOne({ id: idOrSlug })) ||
    (await db.collection<Plan>(PLANS_COLLECTION).findOne({ slug: idOrSlug }))
  if (!plan) return null

  await db.collection(PLANS_COLLECTION).updateMany(
    { type: plan.type },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } }
  )
  await db.collection(PLANS_COLLECTION).updateOne(
    { id: plan.id },
    { $set: { isActive: true, updatedAt: new Date().toISOString() } }
  )

  if (plan.type === 'artist') {
    const artistPlanMode = plan.requiresPayment || plan.price > 0 ? 'paid' : 'free'
    await db.collection('settings').updateOne(
      { settingsId: 'app_settings' },
      {
        $set: {
          settingsId: 'app_settings',
          artistPlanMode,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    )
  }

  return db.collection<Plan>(PLANS_COLLECTION).findOne({ id: plan.id })
}

export function getPlanPriceLabel(plan: Plan): string {
  if (plan.price === 0) return 'Free'
  return `$${plan.price}/yr`
}
