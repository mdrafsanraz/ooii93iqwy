'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import AnimatedBrandLogo from '@/components/AnimatedBrandLogo'

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
          <AnimatedBrandLogo gradientId="headerWaveGradient" className="h-9 md:h-11 w-auto" />

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
