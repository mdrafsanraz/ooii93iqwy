'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/98 shadow-md backdrop-blur-sm' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" className="h-10 md:h-12 w-auto">
              <defs>
                <linearGradient id="headerWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#374151', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              
              {/* Sound wave visualization */}
              <g transform="translate(20, 30)">
                <rect x="0" y="20" width="3" height="20" fill="url(#headerWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="20;35;20" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="20;12.5;20" dur="1.5s" repeatCount="indefinite"/>
                </rect>
                <rect x="8" y="15" width="3" height="30" fill="url(#headerWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="30;40;30" dur="1.8s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="15;10;15" dur="1.8s" repeatCount="indefinite"/>
                </rect>
                <rect x="16" y="10" width="3" height="40" fill="url(#headerWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="40;45;40" dur="1.2s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="10;7.5;10" dur="1.2s" repeatCount="indefinite"/>
                </rect>
                <rect x="24" y="18" width="3" height="24" fill="url(#headerWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="24;38;24" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="18;11;18" dur="2s" repeatCount="indefinite"/>
                </rect>
                <rect x="32" y="12" width="3" height="36" fill="url(#headerWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="36;42;36" dur="1.6s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="12;9;12" dur="1.6s" repeatCount="indefinite"/>
                </rect>
                
                <path d="M45 25 L55 20 L53 22 L58 22 L58 28 L53 28 L55 30 Z" fill="url(#headerWaveGradient)" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                </path>
                <path d="M45 35 L55 30 L53 32 L58 32 L58 38 L53 38 L55 40 Z" fill="url(#headerWaveGradient)" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
                </path>
              </g>
              
              {/* Company name */}
              <text x="100" y="60" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="url(#headerWaveGradient)">RDISTRO</text>
              <text x="100" y="76" fontFamily="Arial, sans-serif" fontWeight="300" fontSize="12" fill="#6b7280" letterSpacing="2px">MUSIC DISTRIBUTION</text>
              
              {/* Subtle connecting dots */}
              <circle cx="75" cy="30" r="2" fill="#8b5cf6" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="80" cy="45" r="1.5" fill="#ec4899" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="85" cy="35" r="1" fill="#6366f1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="relative text-gray-700 hover:text-black transition-colors font-medium group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/#features" className="relative text-gray-700 hover:text-black transition-colors font-medium group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/#pricing" className="relative text-gray-700 hover:text-black transition-colors font-medium group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/contact" className="relative text-gray-700 hover:text-black transition-colors font-medium group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/signup"
              className="px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign Up
            </Link>
            <Link 
              href="https://portal.rdistro.net"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-black hover:text-black transition-all duration-300"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/" 
                className="py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/#features" 
                className="py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/#pricing" 
                className="py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className="py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex gap-2 mt-2 px-4">
                <Link 
                  href="/signup"
                  className="flex-1 py-2 text-center bg-gray-200 text-black rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link 
                  href="https://portal.rdistro.net"
                  className="flex-1 py-2 text-center bg-gray-500 text-white rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
