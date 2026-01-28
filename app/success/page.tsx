'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function SuccessContent() {
  const searchParams = useSearchParams()
  const isTrial = searchParams.get('trial') === 'true'
  const transactionId = searchParams.get('txn_id') || searchParams.get('setup_intent') || searchParams.get('payment_intent')
  const [confetti, setConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 5000)
    
    // Google Ads conversion tracking with transaction ID
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      // Generate fallback transaction ID if none provided
      const txnId = transactionId || `RD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-17911221416/hDrjCPnr0e4bEKiZ3txC',
        'transaction_id': txnId
      })
    }
    
    return () => clearTimeout(timer)
  }, [transactionId])

  return (
    <>
      {/* Confetti Animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `confetti ${3 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'][Math.floor(Math.random() * 6)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-16 text-center relative z-20">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {isTrial ? 'Welcome to RDistro!' : 'Payment Successful!'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            {isTrial 
              ? 'Your free trial has been activated.' 
              : 'Thank you for subscribing to RDistro.'}
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-medium text-gray-700">Check your email</span>
          </div>
          
          <p className="text-gray-600 mb-6">
            We&apos;ve sent you a confirmation email with your account details and next steps. 
            Please check your inbox (and spam folder) for instructions on how to get started.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 text-left">
            <h3 className="font-semibold text-black mb-4">What happens next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                <span className="text-gray-600">Check your email for login credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                <span className="text-gray-600">Log in to your artist portal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                <span className="text-gray-600">Upload your music and artwork</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
                <span className="text-gray-600">Your music goes live in 24-48 hours!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://portal.rdistro.net"
            className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all inline-flex items-center justify-center gap-2"
          >
            Go to Artist Portal
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <Link
            href="/"
            className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Back to Home
          </Link>
        </div>

        {/* Support Note */}
        <p className="mt-12 text-gray-500 text-sm">
          Need help? Contact us at{' '}
          <a href="mailto:support@rdistro.net" className="text-black font-medium hover:underline">
            support@rdistro.net
          </a>
        </p>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="h-10 bg-gray-100 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
      <div className="h-6 bg-gray-100 rounded-lg w-48 mx-auto animate-pulse"></div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <>
      <Header />
      
      <main className="pt-24 min-h-screen bg-gradient-to-b from-green-50 to-white relative overflow-hidden">
        <Suspense fallback={<LoadingFallback />}>
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />
    </>
  )
}
