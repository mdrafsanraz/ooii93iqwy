import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RDistro - Music Distribution',
  description: 'Distribute your music to Spotify, Apple Music, and 150+ streaming platforms. Keep 100% of your rights and royalties.',
  keywords: ['music distribution', 'rdistro', 'spotify', 'apple music', 'artist', 'label'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/logo.jpg" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
