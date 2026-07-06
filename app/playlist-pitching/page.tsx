import type { Metadata } from 'next'
import FeaturePage from '@/components/feature/FeaturePage'
import { playlistPitchingConfig } from '@/lib/featurePages'

export const metadata: Metadata = {
  title: 'Playlist Pitching | RDistro',
  description:
    'Pitch your unreleased music for editorial playlist consideration on Spotify, Apple Music, and more. Built into RDistro distribution.',
}

export default function PlaylistPitchingPage() {
  return <FeaturePage config={playlistPitchingConfig} />
}
