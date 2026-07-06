'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { FeaturePageConfig } from '@/lib/featurePages'
import { FeatureIllustration } from './FeatureIllustrations'

interface FeaturePageProps {
  config: FeaturePageConfig
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const items = root.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('feature-revealed')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return ref
}

export default function FeaturePage({ config }: FeaturePageProps) {
  const containerRef = useScrollReveal()

  return (
    <>
      <style jsx global>{`
        .feature-page-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f5f5f5 100%);
          background-size: 200% 200%;
          animation: featureBgShift 18s ease infinite;
        }

        @keyframes featureBgShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .feature-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.35;
          animation: featureOrbFloat 12s ease-in-out infinite;
        }

        @keyframes featureOrbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.08); }
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }

        [data-reveal].feature-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        [data-reveal-delay='1'] { transition-delay: 0.1s; }
        [data-reveal-delay='2'] { transition-delay: 0.2s; }
        [data-reveal-delay='3'] { transition-delay: 0.3s; }
        [data-reveal-delay='4'] { transition-delay: 0.4s; }
        [data-reveal-delay='5'] { transition-delay: 0.5s; }

        .feature-card-shine {
          position: relative;
          overflow: hidden;
        }

        .feature-card-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: rotate(25deg);
          animation: featureShine 5s ease-in-out infinite;
        }

        @keyframes featureShine {
          0%, 100% { left: -60%; }
          50% { left: 120%; }
        }

        .feature-hero-enter {
          animation: featureHeroEnter 0.9s ease forwards;
        }

        @keyframes featureHeroEnter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .feature-illus-enter {
          animation: featureIllusEnter 1.1s ease 0.2s forwards;
          opacity: 0;
        }

        @keyframes featureIllusEnter {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div className="feature-page-bg" />
      <div
        className="feature-orb w-72 h-72 -top-20 -right-20"
        style={{ background: config.accentFrom }}
      />
      <div
        className="feature-orb w-96 h-96 bottom-40 -left-32"
        style={{ background: config.accentTo, animationDelay: '-4s' }}
      />

      <Header />

      <main ref={containerRef} className="pt-24 md:pt-28 pb-8">
        {/* Hero */}
        <section className="px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="feature-hero-enter">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 text-white"
                style={{ background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})` }}
              >
                {config.badge}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
                {config.title}{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})` }}
                >
                  {config.titleAccent}
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                {config.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/#pricing"
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-black hover:text-black transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="feature-illus-enter relative">
              <div
                className="absolute inset-4 rounded-3xl opacity-20 blur-2xl"
                style={{ background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})` }}
              />
              <FeatureIllustration type={config.illustration} className="relative z-10" />
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div data-reveal className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Built for how you actually release music
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-grade tools without the enterprise price tag — included with your RDistro account.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.highlights.map((item, i) => (
                <div
                  key={item.title}
                  data-reveal
                  data-reveal-delay={String((i % 5) + 1)}
                  className="feature-card-shine p-6 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps (playlist pitching) */}
        {config.steps && (
          <section className="px-4 py-16 bg-gray-50/80">
            <div className="max-w-4xl mx-auto">
              <h2 data-reveal className="text-3xl font-bold text-center text-black mb-12">
                How pitching works
              </h2>
              <div className="space-y-6">
                {config.steps.map((step, i) => (
                  <div
                    key={step.title}
                    data-reveal
                    data-reveal-delay={String(i + 1)}
                    className="flex gap-6 items-start p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="shrink-0 w-12 h-12 rounded-full text-white font-bold text-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})` }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-black mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 py-20">
          <div
            data-reveal
            className="max-w-4xl mx-auto text-center rounded-3xl px-8 py-16 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})` }}
          >
            <div className="absolute inset-0 opacity-10 pattern-dots" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{config.ctaTitle}</h2>
              <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">{config.ctaSubtitle}</p>
              <Link
                href="/signup"
                className="inline-block bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
