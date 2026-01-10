'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Logo from '@/components/Logo'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const isTrial = searchParams.get('trial') === 'true'

  return (
    <div className="flex items-center justify-center px-4 py-8 md:py-16">
      <div className="text-center max-w-sm w-full">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center"
        >
          {isTrial ? (
            <span className="text-2xl">🎁</span>
          ) : (
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-[var(--text)] mb-2"
        >
          {isTrial ? 'Free Trial Started!' : 'Registration Complete!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-[var(--text-muted)] mb-6"
        >
          {isTrial 
            ? 'Your 1-month free trial has been activated.'
            : 'Payment successful. Welcome to RDistro!'
          }
        </motion.p>

        {/* Trial Warning */}
        {isTrial && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-4 mb-4 text-left bg-warning/5 border-warning/20"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-medium text-sm text-[var(--text)]">Trial Information</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Your card will be charged <strong>$20/year</strong> after 30 days unless you cancel.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 mb-4 text-left"
        >
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              📧
            </div>
            <div>
              <h3 className="font-medium text-sm text-[var(--text)]">Check your email</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Login credentials will be sent within 24-48 hours.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4 mb-6"
        >
          <div className="space-y-2">
            {[
              isTrial ? 'Free trial activated' : 'Confirmation email sent',
              'Account setup in progress',
              'Credentials via email',
              'Start distributing!',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                  {i + 1}
                </div>
                <span className="text-xs text-[var(--text-muted)]">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          href="https://rdistro.net"
          className="btn-secondary inline-flex items-center gap-1.5 text-sm"
        >
          ← Back to RDistro
        </motion.a>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="text-lg font-bold text-[var(--text)]">RDistro</span>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center py-16">
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
