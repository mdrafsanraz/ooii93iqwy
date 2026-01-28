import type { Metadata } from 'next'
import Script from 'next/script'
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
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17911221416"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17911221416');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}
