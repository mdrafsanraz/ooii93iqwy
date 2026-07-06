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
const SETTINGS_DOC_ID = 'app_settings'

async function getSettingsDoc() {
  const db = await getDatabase()
  return db.collection('settings').findOne({ settingsId: SETTINGS_DOC_ID })
}

async function getActiveSlugsFromSettings(): Promise<{ artist: string; label: string }> {
  const settings = await getSettingsDoc()
  return {
    artist: settings?.activeArtistPlanSlug || 'artist_free',
    label: settings?.activeLabelPlanSlug || 'label_20',
  }
}

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
      '100% royalties',
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
      '100% royalties',
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

const PRESET_SLUGS = PRESET_PLANS.map((p) => p.slug)

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
    const slugs = await getActiveSlugsFromSettings()
    const activeSlug = type === 'artist' ? slugs.artist : slugs.label
    const active = await db.collection<Plan>(PLANS_COLLECTION).findOne({ slug: activeSlug })
    if (!active) {
      const fallbackSlug = type === 'artist' ? 'artist_free' : 'label_20'
      await setActivePlan(fallbackSlug)
    }
  }

  await db.collection(PLANS_COLLECTION).updateMany(
    { slug: { $nin: PRESET_PLANS.map((p) => p.slug) } },
    { $set: { isActive: false, updatedAt: now } }
  )

  const slugs = await getActiveSlugsFromSettings()
  const settings = await getSettingsDoc()
  if (!settings?.activeArtistPlanSlug || !settings?.activeLabelPlanSlug) {
    await db.collection('settings').updateOne(
      { settingsId: SETTINGS_DOC_ID },
      {
        $set: {
          settingsId: SETTINGS_DOC_ID,
          activeArtistPlanSlug: slugs.artist,
          activeLabelPlanSlug: slugs.label,
          updatedAt: now,
        },
      },
      { upsert: true }
    )
  }
}

/** @deprecated use ensurePresetPlans */
export async function ensureDefaultPlans(): Promise<void> {
  return ensurePresetPlans()
}

export async function getAllPlans(): Promise<Plan[]> {
  await ensurePresetPlans()
  const db = await getDatabase()
  const slugs = await getActiveSlugsFromSettings()
  const plans = await db
    .collection<Plan>(PLANS_COLLECTION)
    .find({ slug: { $in: PRESET_SLUGS } })
    .sort({ type: 1, sortOrder: 1 })
    .toArray()

  return plans.map((plan) => ({
    ...plan,
    isActive: plan.slug === slugs.artist || plan.slug === slugs.label,
  }))
}

export async function getActivePlans(): Promise<Plan[]> {
  await ensurePresetPlans()
  const db = await getDatabase()
  const slugs = await getActiveSlugsFromSettings()
  const plans = await db
    .collection<Plan>(PLANS_COLLECTION)
    .find({ slug: { $in: [slugs.artist, slugs.label] } })
    .sort({ type: 1, sortOrder: 1 })
    .toArray()

  return plans.map((plan) => ({ ...plan, isActive: true }))
}

export async function getActivePlan(type: PlanType): Promise<Plan | null> {
  await ensurePresetPlans()
  const db = await getDatabase()
  const slugs = await getActiveSlugsFromSettings()
  const slug = type === 'artist' ? slugs.artist : slugs.label
  const plan = await db.collection<Plan>(PLANS_COLLECTION).findOne({ slug })
  return plan ? { ...plan, isActive: true } : null
}

export async function setActivePlan(idOrSlug: string): Promise<Plan | null> {
  const db = await getDatabase()
  const plan =
    (await db.collection<Plan>(PLANS_COLLECTION).findOne({ id: idOrSlug })) ||
    (await db.collection<Plan>(PLANS_COLLECTION).findOne({ slug: idOrSlug }))
  if (!plan) return null

  await db.collection(PLANS_COLLECTION).updateMany(
    { type: plan.type, slug: { $in: PRESET_SLUGS } },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } }
  )
  await db.collection(PLANS_COLLECTION).updateOne(
    { id: plan.id },
    { $set: { isActive: true, updatedAt: new Date().toISOString() } }
  )

  const artistPlanMode = plan.requiresPayment || plan.price > 0 ? 'paid' : 'free'
  const settingsUpdate: Record<string, string> = {
    settingsId: SETTINGS_DOC_ID,
    updatedAt: new Date().toISOString(),
  }

  if (plan.type === 'artist') {
    settingsUpdate.artistPlanMode = artistPlanMode
    settingsUpdate.activeArtistPlanSlug = plan.slug
  } else {
    settingsUpdate.activeLabelPlanSlug = plan.slug
  }

  await db.collection('settings').updateOne(
    { settingsId: SETTINGS_DOC_ID },
    { $set: settingsUpdate },
    { upsert: true }
  )

  return db.collection<Plan>(PLANS_COLLECTION).findOne({ id: plan.id })
}

export async function updatePlanStripePrice(
  idOrSlug: string,
  stripePriceId: string
): Promise<Plan | null> {
  const db = await getDatabase()
  const trimmed = stripePriceId.trim()
  if (!trimmed.startsWith('price_')) {
    throw new Error('Stripe Price ID must start with price_')
  }

  const plan =
    (await db.collection<Plan>(PLANS_COLLECTION).findOne({ id: idOrSlug })) ||
    (await db.collection<Plan>(PLANS_COLLECTION).findOne({ slug: idOrSlug }))
  if (!plan) return null

  await db.collection(PLANS_COLLECTION).updateOne(
    { id: plan.id },
    {
      $set: {
        stripePriceId: trimmed,
        updatedAt: new Date().toISOString(),
      },
    }
  )

  return db.collection<Plan>(PLANS_COLLECTION).findOne({ id: plan.id })
}

export function getPlanPriceLabel(plan: Plan): string {
  if (plan.price === 0) return 'Free'
  return `$${plan.price}/yr`
}
