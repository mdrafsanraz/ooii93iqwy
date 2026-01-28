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

interface CheckoutFormProps {
  formData: FormData
  paymentType?: 'payment' | 'setup'
}

export default function CheckoutForm({ formData, paymentType = 'payment' }: CheckoutFormProps) {
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

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rdistro.net'
    const returnUrl = formData.freeTrial 
      ? `${baseUrl}/success?trial=true`
      : `${baseUrl}/success`

    // Use confirmSetup for trials (SetupIntent), confirmPayment for paid (PaymentIntent)
    if (paymentType === 'setup' || formData.freeTrial) {
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Setup failed')
        setIsProcessing(false)
        return
      }

      // Success - send notification and redirect
      await sendNotification()
      window.location.href = returnUrl
    } else {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        await sendNotification(paymentIntent.id, paymentIntent.amount / 100)
        window.location.href = returnUrl
      }
    }

    setIsProcessing(false)
  }

  const sendNotification = async (paymentId?: string, amount?: number) => {
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentIntentId: paymentId || 'subscription',
          amount: amount ?? (formData.freeTrial ? 0 : (formData.plan === 'artist' ? 5 : 20)),
          freeTrial: formData.freeTrial,
          trialEndDate: formData.freeTrial 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        }),
      })
    } catch { /* continue */ }
  }

  const getButtonText = () => {
    if (isProcessing) return 'Processing...'
    if (formData.freeTrial) return '🎁 Start Free Trial'
    if (formData.plan === 'artist') return '🔒 Pay $5/year'
    return '🔒 Pay $20/year'
  }

  const getSubText = () => {
    if (formData.freeTrial) {
      return '🔒 Card saved securely • Auto-charges $20/year after 30 days'
    }
    if (formData.plan === 'artist') {
      return '🔒 Secured by Stripe • Auto-renews yearly'
    }
    return '🔒 Secured by Stripe • Auto-renews yearly'
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
        {isProcessing && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {getButtonText()}
      </button>

      <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">
        {getSubText()}
      </p>
    </form>
  )
}
