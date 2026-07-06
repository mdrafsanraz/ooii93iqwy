import SignupClient from '@/components/SignupClient'
import { getPublicPlansData, plansRecordFromList } from '@/lib/publicPlans'

export const dynamic = 'force-dynamic'

export default async function SignupPage() {
  const { plans, trialEnabled } = await getPublicPlansData()

  return (
    <SignupClient
      plans={plansRecordFromList(plans)}
      trialEnabled={trialEnabled}
    />
  )
}
