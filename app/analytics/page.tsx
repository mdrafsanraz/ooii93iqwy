import type { Metadata } from 'next'
import FeaturePage from '@/components/feature/FeaturePage'
import { analyticsConfig } from '@/lib/featurePages'

export const metadata: Metadata = {
  title: 'Analytics | RDistro',
  description:
    'Track streams, revenue, and audience insights with RDistro analytics. Daily trends, platform breakdowns, and exportable reports for artists and labels.',
}

export default function AnalyticsPage() {
  return <FeaturePage config={analyticsConfig} />
}
