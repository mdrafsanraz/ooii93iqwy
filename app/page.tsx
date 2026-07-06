import HomePageClient from '@/components/HomePageClient'
import { getPublicPlansData } from '@/lib/publicPlans'

export const revalidate = 60

export default async function HomePage() {
  const { plans, trialEnabled } = await getPublicPlansData()

  return <HomePageClient activePlans={plans} trialEnabled={trialEnabled} />
}
