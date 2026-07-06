import { getDatabase } from './mongodb'

export type PlanType = 'artist' | 'label'

export interface Plan {
  id: string
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

const DEFAULT_PLANS: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
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
    isActive: true,
    requiresPayment: false,
    royaltyPercent: 80,
    sortOrder: 0,
  },
  {
    type: 'artist',
    name: 'Artist Pro',
    price: 5,
    period: 'year',
    description: 'Previous paid Artist plan',
    features: [
      'Unlimited releases',
      '150+ platforms',
      '100% royalties',
      'Basic analytics',
      '48h release',
    ],
    icon: '🎤',
    popular: false,
    isActive: false,
    requiresPayment: true,
    royaltyPercent: 100,
    sortOrder: 1,
  },
  {
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
    isActive: true,
    requiresPayment: true,
    royaltyPercent: 100,
    sortOrder: 0,
  },
]

function createPlanId() {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function ensureDefaultPlans(): Promise<void> {
  const db = await getDatabase()
  const count = await db.collection(PLANS_COLLECTION).countDocuments()
  if (count > 0) return

  const now = new Date().toISOString()
  await db.collection(PLANS_COLLECTION).insertMany(
    DEFAULT_PLANS.map((plan) => ({
      ...plan,
      id: createPlanId(),
      createdAt: now,
      updatedAt: now,
    }))
  )
}

export async function getAllPlans(): Promise<Plan[]> {
  await ensureDefaultPlans()
  const db = await getDatabase()
  return db
    .collection<Plan>(PLANS_COLLECTION)
    .find({})
    .sort({ type: 1, sortOrder: 1, createdAt: 1 })
    .toArray()
}

export async function getActivePlans(): Promise<Plan[]> {
  await ensureDefaultPlans()
  const db = await getDatabase()
  return db
    .collection<Plan>(PLANS_COLLECTION)
    .find({ isActive: true })
    .sort({ type: 1, sortOrder: 1 })
    .toArray()
}

export async function getActivePlan(type: PlanType): Promise<Plan | null> {
  await ensureDefaultPlans()
  const db = await getDatabase()
  return db.collection<Plan>(PLANS_COLLECTION).findOne({ type, isActive: true })
}

export async function createPlan(
  data: Omit<Plan, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
): Promise<Plan> {
  const db = await getDatabase()
  const now = new Date().toISOString()
  const plan: Plan = {
    ...data,
    id: createPlanId(),
    isActive: false,
    createdAt: now,
    updatedAt: now,
  }
  await db.collection(PLANS_COLLECTION).insertOne(plan)
  return plan
}

export async function updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | null> {
  const db = await getDatabase()
  const { id: _id, createdAt, ...safeUpdates } = updates
  await db.collection(PLANS_COLLECTION).updateOne(
    { id },
    { $set: { ...safeUpdates, updatedAt: new Date().toISOString() } }
  )
  return db.collection<Plan>(PLANS_COLLECTION).findOne({ id })
}

export async function setActivePlan(id: string): Promise<Plan | null> {
  const db = await getDatabase()
  const plan = await db.collection<Plan>(PLANS_COLLECTION).findOne({ id })
  if (!plan) return null

  await db.collection(PLANS_COLLECTION).updateMany(
    { type: plan.type },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } }
  )
  await db.collection(PLANS_COLLECTION).updateOne(
    { id },
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

  return db.collection<Plan>(PLANS_COLLECTION).findOne({ id })
}

export async function deletePlan(id: string): Promise<boolean> {
  const db = await getDatabase()
  const plan = await db.collection<Plan>(PLANS_COLLECTION).findOne({ id })
  if (!plan || plan.isActive) return false
  const result = await db.collection(PLANS_COLLECTION).deleteOne({ id })
  return result.deletedCount === 1
}
