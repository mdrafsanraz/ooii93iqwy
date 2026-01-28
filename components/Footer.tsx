'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block group">
              <h3 className="text-2xl font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                RDistro
              </h3>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Professional music distribution platform for independent artists and record labels worldwide.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { name: 'Facebook', href: 'https://www.facebook.com/rdistro.official', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { name: 'Instagram', href: '#', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                { name: 'X', href: '#', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { name: 'YouTube', href: '#', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  aria-label={social.name}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-black mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Distribution', href: '/#features' },
                { label: 'Analytics', href: '/#features' },
                { label: 'Playlist Pitching', href: '/#features' },
                { label: 'Artist Tools', href: '/#features' },
                { label: 'Pricing', href: '/#pricing' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-black transition-all duration-200 text-sm inline-block hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-black mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Contact', href: '/contact' },
                { label: 'Artist Resources', href: '#' },
                { label: 'API Documentation', href: '#' },
                { label: 'Status', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-black transition-all duration-200 text-sm inline-block hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-black mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Press', href: '#' },
                { label: 'Legal', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-black transition-all duration-200 text-sm inline-block hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} RDistro. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-gray-500 hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-black transition-colors">Terms of Service</Link>
            <Link href="#" className="text-gray-500 hover:text-black transition-colors">Cookies</Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-xl z-50 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  )
}
