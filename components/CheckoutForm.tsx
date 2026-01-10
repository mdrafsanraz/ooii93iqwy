'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'

interface FormData {
  plan: 'artist' | 'label' | null
  name: string
  email: string
  phone: string
  country: string
  artistName: string
  labelName: string
  socialLinks: string
  spotifyLink: string
  freeTrial: boolean
}

export default function CheckoutForm({ formData }: { formData: FormData }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'Error occurred')
      setIsProcessing(false)
      return
    }

    // For free trial (subscription), we confirm setup
    if (formData.freeTrial) {
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success?trial=true`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Setup failed')
        setIsProcessing(false)
        return
      }

      // If no redirect required, send notification and redirect
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            paymentIntentId: 'subscription_trial',
            amount: 0,
            freeTrial: true,
            trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        })
      } catch { /* continue */ }
      
      window.location.href = '/success?trial=true'
    } else {
      // Regular payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/success` },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        try {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              freeTrial: false,
            }),
          })
        } catch { /* continue */ }
        window.location.href = '/success'
      }
    }

    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : formData.freeTrial ? (
          <>🎁 Start Free Trial</>
        ) : (
          <>🔒 Pay Now</>
        )}
      </button>

      <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">
        {formData.freeTrial 
          ? '🔒 Card saved securely • Auto-charges $20/year after 30 days'
          : '🔒 Secured by Stripe'
        }
      </p>
    </form>
  )
}
