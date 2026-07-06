import { NextResponse } from 'next/server'
import { getPublicPlansData } from '@/lib/publicPlans'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

export async function GET() {
  const { plans, trialEnabled } = await getPublicPlansData()
  return NextResponse.json({ plans, trialEnabled }, { headers: NO_CACHE_HEADERS })
}
