import type { Metadata } from 'next'
import FeaturePage from '@/components/feature/FeaturePage'
import { artistToolsConfig } from '@/lib/featurePages'

export const metadata: Metadata = {
  title: 'Artist Tools | RDistro',
  description:
    'Smart links, pre-saves, promo graphics, and fan tools — everything you need to launch releases with momentum on RDistro.',
}

export default function ArtistToolsPage() {
  return <FeaturePage config={artistToolsConfig} />
}
