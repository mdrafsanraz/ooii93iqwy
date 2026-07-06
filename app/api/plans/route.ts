import { NextResponse } from 'next/server'
import { getActivePlans, ensurePresetPlans, type Plan } from '@/lib/plans'
import { getDatabase } from '@/lib/mongodb'

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'artist_free',
    slug: 'artist_free',
    type: 'artist',
    name: 'Artist',
    price: 0,
    period: 'year',
    description: 'Free for independent artists',
    features: ['Unlimited releases', '150+ platforms', '80% royalties', 'Basic analytics', '48h release', 'No credit card required'],
    icon: '🎤',
    popular: true,
    isActive: true,
    requiresPayment: false,
    royaltyPercent: 80,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'label_20',
    slug: 'label_20',
    type: 'label',
    name: 'Label',
    price: 20,
    period: 'year',
    description: 'For labels & managers',
    features: ['Everything in Artist', 'Multi-artist management', 'Advanced analytics', 'Priority support', '24h release'],
    icon: '🏢',
    popular: true,
    isActive: true,
    requiresPayment: true,
    royaltyPercent: 100,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
]

export async function GET() {
  try {
    await ensurePresetPlans()
    const plans = await getActivePlans()

    let trialEnabled = true
    try {
      const db = await getDatabase()
      const settings = await db.collection('settings').findOne({ settingsId: 'app_settings' })
      trialEnabled = settings?.trialEnabled ?? true
    } catch {
      // use default
    }

    return NextResponse.json({ plans: plans.length > 0 ? plans : FALLBACK_PLANS, trialEnabled })
  } catch (error) {
    console.error('Plans GET error:', error)
    return NextResponse.json({ plans: FALLBACK_PLANS, trialEnabled: true })
  }
}
