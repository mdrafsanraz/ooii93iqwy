'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
  useEffect(() => {
    // Smooth scrolling for anchor links
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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick as EventListener)
    })

    // Floating notes animation
    const createFloatingNote = () => {
      const notes = ['♪', '♫', '♬', '♩', '♭', '♯', '𝄞']
      const container = document.getElementById('floatingNotes')
      if (!container) return

      const note = document.createElement('div')
      note.className = 'floating-note'
      note.textContent = notes[Math.floor(Math.random() * notes.length)]
      note.style.left = Math.random() * 100 + '%'
      note.style.animationDuration = (Math.random() * 10 + 15) + 's'
      note.style.animationDelay = Math.random() * 5 + 's'
      
      container.appendChild(note)
      
      setTimeout(() => {
        if (note.parentNode) {
          note.parentNode.removeChild(note)
        }
      }, 25000)
    }

    const interval = setInterval(createFloatingNote, 2000)
    for (let i = 0; i < 5; i++) {
      setTimeout(createFloatingNote, i * 1000)
    }

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style jsx global>{`
        .gradient-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -2;
          background: linear-gradient(-45deg, #f0f0f0, #ffffff, #f8f8f8, #f5f5f5);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .floating-note {
          position: absolute;
          font-size: 2rem;
          color: #000;
          animation: float 20s infinite linear;
          opacity: 0.3;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 1s ease-out forwards;
        }

        .animate-slide-up-delay-1 {
          animation: slideUp 1s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-2 {
          animation: slideUp 1s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-3 {
          animation: slideUp 1s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="gradient-bg" />
      <div className="fixed inset-0 z-[-1] opacity-10">
        <div id="floatingNotes" className="absolute inset-0" />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-4 relative">
        {/* Background SVG */}
        <svg 
          className="absolute top-[10%] left-1/2 -translate-x-1/2 z-[-1] opacity-10"
          width="600" 
          height="400" 
          viewBox="0 0 600 400"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 0.1 }} />
              <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>
          <path d="M0,200 Q150,100 300,200 T600,200 L600,400 L0,400 Z" fill="url(#waveGradient)">
            <animateTransform attributeName="transform" type="translate" values="0,0; -100,0; 0,0" dur="10s" repeatCount="indefinite"/>
          </path>
          <path d="M0,250 Q200,150 400,250 T800,250 L800,400 L0,400 Z" fill="url(#waveGradient)" opacity="0.5">
            <animateTransform attributeName="transform" type="translate" values="0,0; 100,0; 0,0" dur="15s" repeatCount="indefinite"/>
          </path>
        </svg>

        <div className="max-w-3xl text-center">
          <div className="animate-slide-up inline-block bg-gray-100/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
            🎵 Trusted by 50,000+ artists worldwide
          </div>
          
          <h1 className="animate-slide-up-delay-1 text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Distribute your music everywhere
          </h1>
          
          <p className="animate-slide-up-delay-2 text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            Get your music on Spotify, Apple Music, and 150+ streaming platforms. 
            Keep 100% of your rights and royalties.
          </p>
          
          <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup" 
              className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign Up Free
            </Link>
            <Link 
              href="#pricing" 
              className="text-gray-600 font-medium hover:text-black transition-all flex items-center gap-2 group"
            >
              View Pricing <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Professional music distribution tools designed for independent artists and record labels.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🌍', title: 'Global Distribution', desc: 'Distribute to 150+ streaming platforms and digital stores worldwide including Spotify, Apple Music, Amazon, and more.' },
              { icon: '💰', title: 'Keep 100% Rights', desc: 'You own your music, you keep your rights. We collect and pay your royalties with complete transparency.' },
              { icon: '📊', title: 'Real-time Analytics', desc: 'Track your performance with detailed streaming data, audience insights, and revenue reports updated daily.' },
              { icon: '⚡', title: 'Fast Release', desc: 'Get your music live on all platforms in just 24-48 hours with our streamlined submission process.' },
              { icon: '🎯', title: 'Playlist Pitching', desc: 'Submit your tracks directly to Spotify editorial playlists and increase your chances of being discovered.' },
              { icon: '🛠️', title: 'Artist Tools', desc: 'Access pre-save campaigns, smart links, promotional assets, and social media tools to boost your releases.' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gray-100/80 rounded-lg flex items-center justify-center text-2xl mb-4 transition-transform hover:scale-110 hover:rotate-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50/80 backdrop-blur-sm relative overflow-hidden">
        <div 
          className="absolute inset-0 z-[-1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '150+', label: 'Streaming platforms' },
              { number: '50K+', label: 'Active artists' },
              { number: '10M+', label: 'Songs distributed' },
              { number: '195', label: 'Countries reached' },
            ].map((stat, i) => (
              <div key={i} className="hover:scale-105 transition-transform">
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-4">
            How it works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Get your music distributed to the world in three simple steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Upload your music', desc: 'Upload your tracks, add artwork, and fill in your release information through our simple interface.' },
              { step: 2, title: 'We distribute everywhere', desc: 'We deliver your music to Spotify, Apple Music, Amazon, and 150+ other streaming platforms worldwide.' },
              { step: 3, title: 'Collect your royalties', desc: 'Track performance, monitor streams, and collect 100% of your royalties through our analytics dashboard.' },
            ].map((item, i) => (
              <div key={i} className="text-center hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover:scale-110 hover:shadow-xl transition-all">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Choose the plan that fits your music distribution needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Artist Plan */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-8 text-center hover:border-black hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-lg font-semibold text-black mb-4">🎤 Artist</h3>
              <div className="text-5xl font-bold text-black mb-2">$5</div>
              <div className="text-gray-600 mb-6">per year</div>
              <ul className="text-left space-y-3 mb-8">
                {['1 Artist', 'Unlimited releases', '450+ streaming platforms', 'Keep 100% royalties', 'Basic analytics', 'Release in 48 hours'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600 hover:text-black hover:translate-x-1 transition-all">
                    <span className="text-green-500 font-bold">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/signup"
                className="block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Label Plan */}
            <div className="relative bg-white/90 backdrop-blur-sm border-2 border-black rounded-xl p-8 text-center scale-105 bg-black/5 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-black mb-4">🏢 Label</h3>
              <div className="text-5xl font-bold text-black mb-2">$20</div>
              <div className="text-gray-600 mb-2">per year</div>
              <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium mb-6">
                🎁 1 Month Free Trial
              </div>
              <ul className="text-left space-y-3 mb-8">
                {['Everything in Artist', 'Unlimited Artist', 'Advanced analytics', 'Priority support', 'Release in 24 hours'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600 hover:text-black hover:translate-x-1 transition-all">
                    <span className="text-green-500 font-bold">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/signup"
                className="block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-700 to-gray-500 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm20 0c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'bgMove 20s linear infinite',
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to distribute your music?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of artists who trust RDistro to get their music heard worldwide.
          </p>
          <Link 
            href="/signup"
            className="inline-block bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
