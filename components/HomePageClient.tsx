'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { WebsitePlan } from '@/lib/publicPlans'

interface HomePageClientProps {
  activePlans: WebsitePlan[]
  trialEnabled: boolean
}

const platforms = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'TikTok', 'Deezer', 'Tidal', 'Instagram']

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

function HeroPreview() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      <div className="absolute -inset-4 bg-gradient-to-br from-violet-200/40 via-transparent to-cyan-200/30 rounded-3xl blur-2xl" />
      <div className="relative bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl shadow-black/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-gray-500 font-medium">Release Dashboard</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-2xl">
              🎵
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-black text-sm truncate">Midnight Drive — Single</p>
              <p className="text-xs text-gray-500">Live on 150+ stores</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Streams', value: '24.8K', trend: '+12%' },
              { label: 'Saves', value: '1.2K', trend: '+8%' },
              { label: 'Revenue', value: '$186', trend: '+15%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">{stat.label}</p>
                <p className="text-sm font-bold text-black">{stat.value}</p>
                <p className="text-[10px] text-green-600 font-medium">{stat.trend}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Weekly streams</span>
              <span>Last 7 days</span>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {[35, 52, 40, 68, 55, 78, 92].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-gray-900 to-gray-500 rounded-sm origin-bottom"
                  initial={{ scaleY: 0.3 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute -right-4 top-12 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs font-medium text-black hidden sm:flex items-center gap-2"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-green-500">●</span> New playlist add
      </motion.div>
      <motion.div
        className="absolute -left-4 bottom-16 bg-black text-white rounded-xl px-3 py-2 shadow-lg text-xs font-medium hidden sm:block"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        🌍 42 countries
      </motion.div>
    </div>
  )
}

export default function HomePageClient({ activePlans, trialEnabled }: HomePageClientProps) {
  const artistPlan = activePlans.find((p) => p.type === 'artist')
  const labelPlan = activePlans.find((p) => p.type === 'label')
  const isFreeArtist = artistPlan && !artistPlan.requiresPayment

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.hash) {
        const element = document.querySelector(target.hash)
        if (element) {
          e.preventDefault()
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick as EventListener)
    })

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener)
      })
    }
  }, [])

  const features = [
    { icon: '📊', title: 'Real-time Analytics', desc: 'Streams, audience insights, and revenue — updated daily.', href: '/analytics', large: true },
    { icon: '🎯', title: 'Playlist Pitching', desc: 'Pitch unreleased tracks to editorial curators.', href: '/playlist-pitching', large: true },
    { icon: '🛠️', title: 'Artist Tools', desc: 'Smart links, pre-saves, and promo assets built in.', href: '/artist-tools', large: true },
    { icon: '🌍', title: 'Global Distribution', desc: '150+ platforms worldwide.', href: '/#features', large: false },
    { icon: '💰', title: 'Keep Your Rights', desc: 'You own your music. Transparent royalties.', href: '/#features', large: false },
    { icon: '⚡', title: 'Fast Release', desc: 'Live in 24–48 hours.', href: '/#features', large: false },
  ]

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#fafafa]" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <Header />

      {/* Hero */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Trusted by 50,000+ artists worldwide
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-black mb-6 leading-[1.1] tracking-tight"
            >
              Your music.{' '}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                Every platform.
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg"
            >
              Distribute to Spotify, Apple Music, and 150+ stores.
              {artistPlan && !artistPlan.requiresPayment
                ? ` Start free and keep up to ${artistPlan.royaltyPercent}% of your royalties.`
                : ' Keep 100% of your rights and royalties.'}
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link
                href="/signup"
                className="inline-flex justify-center items-center bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-xl shadow-lg shadow-black/10"
              >
                {isFreeArtist ? 'Sign Up Free' : 'Get Started'}
              </Link>
              <Link
                href="#pricing"
                className="inline-flex justify-center items-center px-8 py-4 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-all bg-white/80"
              >
                View Pricing
              </Link>
            </motion.div>

            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span> No hidden fees
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span> Unlimited releases
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span> 24–48h delivery
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroPreview />
          </motion.div>
        </div>
      </section>

      {/* Platform strip */}
      <section className="py-6 border-y border-gray-200/80 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...platforms, ...platforms].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="mx-8 text-sm font-semibold text-gray-400 uppercase tracking-widest"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Features — bento grid */}
      <section id="features" className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 tracking-tight">
              Built for independent artists
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Distribution, analytics, pitching, and promo tools — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group relative p-6 rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                  feature.large ? 'sm:col-span-1 lg:min-h-[180px]' : ''
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                {feature.large && (
                  <span className="absolute bottom-6 right-6 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all text-lg">
                    →
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gray-900 text-white px-8 py-12 md:py-14 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-600/10" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '150+', label: 'Streaming platforms' },
                { number: '50K+', label: 'Active artists' },
                { number: '10M+', label: 'Songs distributed' },
                { number: '195', label: 'Countries reached' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
              Three steps to worldwide release
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            {[
              { step: 1, title: 'Upload your music', desc: 'Add tracks, artwork, and release info through a simple dashboard.' },
              { step: 2, title: 'We distribute everywhere', desc: 'Your release goes to Spotify, Apple Music, and 150+ platforms.' },
              {
                step: 3,
                title: 'Collect your royalties',
                desc:
                  artistPlan && !artistPlan.requiresPayment
                    ? `Track streams and collect up to ${artistPlan.royaltyPercent}% of royalties from your analytics dashboard.`
                    : 'Track streams and collect 100% of your royalties from your analytics dashboard.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative text-center bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 tracking-tight">
              Simple, transparent plans
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose the plan that fits your career stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{artistPlan?.icon || '🎤'}</span>
                <h3 className="text-lg font-semibold text-black">{artistPlan?.name || 'Artist'}</h3>
              </div>
              <p className="text-xs font-medium text-green-600 mb-4">
                {artistPlan && !artistPlan.requiresPayment
                  ? `FREE • ${artistPlan.royaltyPercent}% royalties • No credit card`
                  : `Paid plan • ${artistPlan?.royaltyPercent || 100}% royalties`}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-bold text-black">${artistPlan?.price ?? 0}</span>
                <span className="text-gray-500 text-sm">
                  {artistPlan && !artistPlan.requiresPayment ? '/ artist' : `/${artistPlan?.period || 'year'}`}
                </span>
              </div>
              <ul className="space-y-3 my-8">
                {(artistPlan?.features?.length
                  ? artistPlan.features
                  : ['Unlimited releases', '150+ platforms', 'Basic analytics', 'Release in 48 hours']
                ).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-gray-100 text-black py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="relative bg-black text-white rounded-2xl p-8 shadow-xl shadow-black/20 hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/10">
              {(labelPlan?.popular ?? true) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{labelPlan?.icon || '🏢'}</span>
                <h3 className="text-lg font-semibold">{labelPlan?.name || 'Label'}</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-bold">${labelPlan?.price ?? 20}</span>
                <span className="text-gray-400 text-sm">/{labelPlan?.period || 'year'}</span>
              </div>
              {trialEnabled && (
                <div className="inline-block bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium mt-2 mb-4">
                  🎁 1 Month Free Trial
                </div>
              )}
              <ul className="space-y-3 my-8">
                {(labelPlan?.features?.length
                  ? labelPlan.features
                  : ['Everything in Artist', 'Multi-artist management', 'Advanced analytics', 'Priority support']
                ).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-green-400">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-white text-black py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto text-center rounded-3xl px-8 py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Ready to release your music?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
              Join thousands of artists distributing worldwide with RDistro.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
      `}</style>
    </>
  )
}
