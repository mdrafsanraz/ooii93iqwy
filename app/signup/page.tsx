'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/CheckoutForm'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

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
  spotifyLink: string
  freeTrial: boolean
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

export default function SignupPage() {
  const [step, setStep] = useState<Step>('plan')
  const [freeTrial, setFreeTrial] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    plan: null,
    name: '',
    email: '',
    phone: '',
    country: '',
    artistName: '',
    labelName: '',
    socialLinks: '',
    spotifyLink: '',
    freeTrial: false,
  })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<'payment' | 'setup'>('payment')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trialEnabled, setTrialEnabled] = useState(true)

  // Fetch trial setting on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setTrialEnabled(data.trialEnabled ?? true)
      })
      .catch(() => {
        // Default to enabled on error
        setTrialEnabled(true)
      })
  }, [])

  const handleFreeTrialToggle = (enabled: boolean) => {
    setFreeTrial(enabled)
    if (enabled) {
      setFormData({ ...formData, plan: 'label', freeTrial: true })
    } else {
      setFormData({ ...formData, plan: null, freeTrial: false })
    }
  }

  const handlePlanSelect = (plan: Plan) => {
    if (freeTrial && plan === 'artist') return // Can't select artist with free trial
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
    setError(null)
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: formData.plan, 
          email: formData.email,
          freeTrial: formData.freeTrial,
        }),
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }
      
      if (!data.clientSecret) {
        throw new Error('No client secret received')
      }
      
      setClientSecret(data.clientSecret)
      setPaymentType(data.type === 'setup' ? 'setup' : 'payment')
      setStep('payment')
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Payment initialization failed')
    } finally {
      setIsLoading(false)
    }
  }

  const isDetailsValid = () => {
    const { name, email, phone, country } = formData
    const baseValid = name && email && phone && country

    if (formData.plan === 'artist') {
      return baseValid && formData.artistName
    }
    
    if (formData.plan === 'label') {
      // If free trial, social links AND spotify link are required
      if (formData.freeTrial) {
        return baseValid && formData.labelName && formData.socialLinks && formData.spotifyLink
      }
      return baseValid && formData.labelName
    }
    
    return false
  }

  const stepIndex = ['plan', 'details', 'payment'].indexOf(step)

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
              <defs>
                <linearGradient id="signupWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#374151', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              
              {/* Sound wave visualization */}
              <g transform="translate(20, 30)">
                <rect x="0" y="20" width="3" height="20" fill="url(#signupWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="20;35;20" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="20;12.5;20" dur="1.5s" repeatCount="indefinite"/>
                </rect>
                <rect x="8" y="15" width="3" height="30" fill="url(#signupWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="30;40;30" dur="1.8s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="15;10;15" dur="1.8s" repeatCount="indefinite"/>
                </rect>
                <rect x="16" y="10" width="3" height="40" fill="url(#signupWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="40;45;40" dur="1.2s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="10;7.5;10" dur="1.2s" repeatCount="indefinite"/>
                </rect>
                <rect x="24" y="18" width="3" height="24" fill="url(#signupWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="24;38;24" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="18;11;18" dur="2s" repeatCount="indefinite"/>
                </rect>
                <rect x="32" y="12" width="3" height="36" fill="url(#signupWaveGradient)" rx="1.5">
                  <animate attributeName="height" values="36;42;36" dur="1.6s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="12;9;12" dur="1.6s" repeatCount="indefinite"/>
                </rect>
                
                <path d="M45 25 L55 20 L53 22 L58 22 L58 28 L53 28 L55 30 Z" fill="url(#signupWaveGradient)" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                </path>
                <path d="M45 35 L55 30 L53 32 L58 32 L58 38 L53 38 L55 40 Z" fill="url(#signupWaveGradient)" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
                </path>
              </g>
              
              {/* Company name */}
              <text x="100" y="60" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="url(#signupWaveGradient)">RDISTRO</text>
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
          <Link 
            href="https://portal.rdistro.net"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Already have an account? <span className="font-medium text-primary">Login</span>
          </Link>
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

                  {/* Free Trial Toggle */}
                  {trialEnabled ? (
                    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                      <label className="flex items-center justify-between cursor-pointer gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[var(--text)]">🎁 1 Month Free Trial</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Label plan only • Auto-charges after 30 days</p>
                        </div>
                        <div className="relative flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={freeTrial}
                            onChange={(e) => handleFreeTrialToggle(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${freeTrial ? 'bg-primary' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${freeTrial ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-xl bg-gray-100 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🎁</span>
                        <div>
                          <p className="font-medium text-sm text-gray-400">Free Trial Unavailable</p>
                          <p className="text-[10px] text-gray-400">Trial is not available at this time</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(plans) as Plan[]).map((planKey) => {
                      const plan = plans[planKey]
                      const isSelected = formData.plan === planKey
                      const isDisabled = freeTrial && planKey === 'artist'
                      
                      return (
                        <div
                          key={planKey}
                          onClick={() => !isDisabled && handlePlanSelect(planKey)}
                          className={`plan-card p-4 ${isSelected ? 'selected' : ''} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-2 left-3 badge-popular px-2 py-0.5 text-[10px] rounded-full">
                              Popular
                            </span>
                          )}
                          
                          {freeTrial && planKey === 'label' && (
                            <span className="absolute -top-2 right-3 bg-success text-white px-2 py-0.5 text-[10px] rounded-full font-medium">
                              Free Trial
                            </span>
                          )}
                          
                          <div className="absolute top-3 right-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary' : 'border-[var(--border)]'
                            } ${isDisabled ? 'opacity-50' : ''}`}>
                              {isSelected && <span className="text-white text-[8px]">✓</span>}
                            </div>
                          </div>

                          <div className="text-2xl mb-2">{plan.icon}</div>
                          <h3 className="font-bold text-[var(--text)]">{plan.name}</h3>
                          <p className="text-[10px] text-[var(--text-muted)] mb-2">{plan.description}</p>
                          
                          <div className="mb-3">
                            {freeTrial && planKey === 'label' ? (
                              <>
                                <span className="text-2xl font-bold text-success">$0</span>
                                <span className="text-xs text-[var(--text-muted)]"> first month</span>
                                <p className="text-[10px] text-[var(--text-muted)]">then ${plan.price}/year</p>
                              </>
                            ) : (
                              <>
                                <span className="text-2xl font-bold text-[var(--text)]">${plan.price}</span>
                                <span className="text-xs text-[var(--text-muted)]">/{plan.period}</span>
                              </>
                            )}
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

                  {formData.freeTrial && (
                    <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-sm font-medium text-success">🎁 1 Month Free Trial</p>
                      <p className="text-[10px] text-success/80">Your card will be charged $20/year after 30 days</p>
                    </div>
                  )}

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
                        {formData.freeTrial ? (
                          <>Facebook / Instagram * <span className="text-[var(--text-muted)] font-normal">(Required for free trial)</span></>
                        ) : (
                          <>Social Links <span className="text-[var(--text-muted)] font-normal">(optional)</span></>
                        )}
                      </label>
                      <input
                        type="text"
                        name="socialLinks"
                        value={formData.socialLinks}
                        onChange={handleInputChange}
                        placeholder={formData.freeTrial ? "facebook.com/yourpage, instagram.com/yourhandle" : "Instagram, Facebook..."}
                        className="input-field text-sm py-2.5"
                      />
                      {formData.freeTrial && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">
                          Enter your Facebook and/or Instagram profile links
                        </p>
                      )}
                    </div>

                    {/* Spotify/Music Link - Required for Free Trial */}
                    {formData.freeTrial && (
                      <div>
                        <label className="block text-xs font-medium text-[var(--text)] mb-1">
                          Spotify / Music Link * <span className="text-[var(--text-muted)] font-normal">(Required for free trial)</span>
                        </label>
                        <input
                          type="url"
                          name="spotifyLink"
                          value={formData.spotifyLink}
                          onChange={handleInputChange}
                          placeholder="https://open.spotify.com/artist/..."
                          className="input-field text-sm py-2.5"
                        />
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">
                          Spotify, Apple Music, SoundCloud, or YouTube Music link
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-3 p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                      ⚠ {error}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{formData.plan && plans[formData.plan].icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{formData.plan && plans[formData.plan].name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formData.freeTrial ? '$0 first month' : `$${formData.plan && plans[formData.plan].price}/yr`}
                        </p>
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
              {step === 'payment' && clientSecret && stripePromise && (
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

                  <h2 className="text-lg font-bold text-[var(--text)] mb-4">
                    {formData.freeTrial ? 'Start Free Trial' : 'Payment'}
                  </h2>

                  {formData.freeTrial && (
                    <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-sm font-medium text-success">🎁 1 Month Free Trial</p>
                      <p className="text-[10px] text-success/80">You won&apos;t be charged today. Card will be charged $20 after 30 days.</p>
                    </div>
                  )}

                  <div className="mb-4 p-3 rounded-xl bg-[var(--surface)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{formData.plan && plans[formData.plan].icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{formData.plan && plans[formData.plan].name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formData.freeTrial ? '30-day free trial' : 'Annual'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {formData.freeTrial ? (
                        <>
                          <p className="text-xl font-bold text-success">$0</p>
                          <p className="text-[10px] text-[var(--text-muted)]">today</p>
                        </>
                      ) : (
                        <p className="text-xl font-bold text-[var(--text)]">${formData.plan && plans[formData.plan].price}</p>
                      )}
                    </div>
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
                    <CheckoutForm formData={formData} paymentType={paymentType} />
                  </Elements>
                </motion.div>
              )}

              {/* Payment Error State */}
              {step === 'payment' && !clientSecret && (
                <motion.div
                  key="payment-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center"
                >
                  <p className="text-error mb-4">Payment initialization failed</p>
                  <button onClick={() => setStep('details')} className="btn-secondary">
                    Go Back
                  </button>
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
