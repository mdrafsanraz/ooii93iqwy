import { NextResponse } from 'next/server'
import { getPublicPlansData } from '@/lib/publicPlans'

export const revalidate = 60

export async function GET() {
  const { plans, trialEnabled } = await getPublicPlansData()
  return NextResponse.json(
    { plans, trialEnabled },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
  )
}
