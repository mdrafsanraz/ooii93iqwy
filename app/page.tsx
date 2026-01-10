'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/CheckoutForm'
import Logo from '@/components/Logo'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Plan = 'artist' | 'label'
type Step = 'plan' | 'details' | 'payment'

interface FormData {
  plan: Plan | null
  name: string
  email: string
  phone: string
  country: string
  artistName: string
  labelName: string
  socialLinks: string
}

const plans = {
  artist: {
    name: 'Artist',
    price: 5,
    period: 'year',
    description: 'For independent artists',
    features: [
      'Unlimited releases',
      '150+ platforms',
      '100% royalties',
      'Basic analytics',
      '48h release',
    ],
    icon: '🎤',
    popular: false,
  },
  label: {
    name: 'Label',
    price: 20,
    period: 'year',
    description: 'For labels & managers',
    features: [
      'Everything in Artist',
      'Multi-artist management',
      'Advanced analytics',
      'Priority support',
      '24h release',
    ],
    icon: '🏢',
    popular: true,
  },
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('plan')
  const [formData, setFormData] = useState<FormData>({
    plan: null,
    name: '',
    email: '',
    phone: '',
    country: '',
    artistName: '',
    labelName: '',
    socialLinks: '',
  })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlanSelect = (plan: Plan) => {
    setFormData({ ...formData, plan })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const goToDetails = () => {
    if (formData.plan) setStep('details')
  }

  const goToPayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: formData.plan, email: formData.email }),
      })
      const data = await response.json()
      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isDetailsValid = () => {
    const { name, email, phone, country } = formData
    if (formData.plan === 'artist') return name && email && phone && country && formData.artistName
    return name && email && phone && country && formData.labelName
  }

  const stepIndex = ['plan', 'details', 'payment'].indexOf(step)

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="text-lg font-bold text-[var(--text)]">RDistro</span>
        </div>
      </header>

      {/* Main */}
      <div className="px-4 py-4 md:py-8">
        <div className="max-w-xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4 md:mb-6"
          >
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">
              Get Started
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Distribute your music worldwide
            </p>
          </motion.div>

          {/* Progress */}
          <div className="flex justify-center items-center gap-2 mb-4 md:mb-6">
            {['Plan', 'Details', 'Payment'].map((label, i) => {
              const isActive = stepIndex === i
              const isCompleted = stepIndex > i
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive ? 'bg-primary text-white' : 
                      isCompleted ? 'bg-success text-white' : 
                      'bg-[var(--surface-dark)] text-[var(--text-muted)]'
                    }`}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div className={`w-4 md:w-8 h-0.5 ${isCompleted ? 'bg-success' : 'bg-[var(--border)]'}`} />}
                </div>
              )
            })}
          </div>

          {/* Card */}
          <motion.div layout className="card overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Plan Selection */}
              {step === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 md:p-6"
                >
                  <h2 className="text-lg font-bold text-[var(--text)] text-center mb-4">Choose Plan</h2>

                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(plans) as Plan[]).map((planKey) => {
                      const plan = plans[planKey]
                      const isSelected = formData.plan === planKey
                      
                      return (
                        <div
                          key={planKey}
                          onClick={() => handlePlanSelect(planKey)}
                          className={`plan-card p-4 ${isSelected ? 'selected' : ''}`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-2 left-3 badge-popular px-2 py-0.5 text-[10px] rounded-full">
                              Popular
                            </span>
                          )}
                          
                          <div className="absolute top-3 right-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary' : 'border-[var(--border)]'
                            }`}>
                              {isSelected && <span className="text-white text-[8px]">✓</span>}
                            </div>
                          </div>

                          <div className="text-2xl mb-2">{plan.icon}</div>
                          <h3 className="font-bold text-[var(--text)]">{plan.name}</h3>
                          <p className="text-[10px] text-[var(--text-muted)] mb-2">{plan.description}</p>
                          
                          <div className="mb-3">
                            <span className="text-2xl font-bold text-[var(--text)]">${plan.price}</span>
                            <span className="text-xs text-[var(--text-muted)]">/{plan.period}</span>
                          </div>

                          <ul className="space-y-1">
                            {plan.features.slice(0, 4).map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                                <span className="text-success text-[8px]">✓</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    onClick={goToDetails}
                    disabled={!formData.plan}
                    className="btn-primary w-full mt-4"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* Details Form */}
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 md:p-6"
                >
                  <button
                    onClick={() => setStep('plan')}
                    className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] mb-3"
                  >
                    ← Back
                  </button>

                  <h2 className="text-lg font-bold text-[var(--text)] mb-4">Your Details</h2>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text)] mb-1">Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="input-field text-sm py-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text)] mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@email.com"
                          className="input-field text-sm py-2.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text)] mb-1">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 234 567"
                          className="input-field text-sm py-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text)] mb-1">Country *</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="USA"
                          className="input-field text-sm py-2.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text)] mb-1">
                        {formData.plan === 'artist' ? 'Artist Name *' : 'Label Name *'}
                      </label>
                      <input
                        type="text"
                        name={formData.plan === 'artist' ? 'artistName' : 'labelName'}
                        value={formData.plan === 'artist' ? formData.artistName : formData.labelName}
                        onChange={handleInputChange}
                        placeholder={formData.plan === 'artist' ? 'Stage name' : 'Label name'}
                        className="input-field text-sm py-2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text)] mb-1">
                        Social Links <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="socialLinks"
                        value={formData.socialLinks}
                        onChange={handleInputChange}
                        placeholder="Instagram, Spotify..."
                        className="input-field text-sm py-2.5"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{formData.plan && plans[formData.plan].icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{formData.plan && plans[formData.plan].name}</p>
                        <p className="text-xs text-[var(--text-muted)]">${formData.plan && plans[formData.plan].price}/yr</p>
                      </div>
                    </div>
                    <button
                      onClick={goToPayment}
                      disabled={!isDetailsValid() || isLoading}
                      className="btn-primary px-6"
                    >
                      {isLoading ? '...' : 'Continue'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Payment */}
              {step === 'payment' && clientSecret && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 md:p-6"
                >
                  <button
                    onClick={() => setStep('details')}
                    className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] mb-3"
                  >
                    ← Back
                  </button>

                  <h2 className="text-lg font-bold text-[var(--text)] mb-4">Payment</h2>

                  <div className="mb-4 p-3 rounded-xl bg-[var(--surface)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{formData.plan && plans[formData.plan].icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{formData.plan && plans[formData.plan].name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Annual</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-[var(--text)]">${formData.plan && plans[formData.plan].price}</p>
                  </div>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#7c3aed',
                          borderRadius: '10px',
                          fontFamily: 'Inter, sans-serif',
                        },
                      },
                    }}
                  >
                    <CheckoutForm formData={formData} />
                  </Elements>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-4">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
