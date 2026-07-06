import SignupClient from '@/components/SignupClient'
import { getPublicPlansData, plansRecordFromList } from '@/lib/publicPlans'

export const revalidate = 60

export default async function SignupPage() {
  const { plans, trialEnabled } = await getPublicPlansData()

  return (
    <SignupClient
      plans={plansRecordFromList(plans)}
      trialEnabled={trialEnabled}
    />
  )
}
