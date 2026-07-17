'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/CheckoutForm'
import AnimatedBrandLogo from '@/components/AnimatedBrandLogo'
import type { WebsitePlan } from '@/lib/publicPlans'

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

type ValidationErrors = Partial<Record<keyof FormData, string>>

interface SignupClientProps {
  plans: Record<Plan, WebsitePlan>
  trialEnabled: boolean
}

export default function SignupClient({ plans: initialPlans, trialEnabled }: SignupClientProps) {
  const [step, setStep] = useState<Step>('plan')
  const [freeTrial, setFreeTrial] = useState(false)
  const plans = initialPlans
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

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
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setValidationErrors(prev => ({ ...prev, [name]: '' }))
  }

  const goToDetails = () => {
    if (formData.plan) setStep('details')
  }

  const isLinkLike = (value: string) => {
    if (!value.trim()) return false
    const links = value
      .split(/[,\n]/)
      .map(link => link.trim())
      .filter(Boolean)

    if (links.length === 0) return false

    return links.every(link => {
      try {
        const normalized = /^(https?:)?\/\//i.test(link) ? link : `https://${link}`
        const parsed = new URL(normalized)
        return !!parsed.hostname && parsed.hostname.includes('.')
      } catch {
        return false
      }
    })
  }

  const validateDetails = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.phone.trim()) errors.phone = 'Phone is required'
    if (!formData.country.trim()) errors.country = 'Country is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address'
    }

    if (formData.plan === 'artist' && !formData.artistName.trim()) {
      errors.artistName = 'Artist name is required'
    }
    if (formData.plan === 'label' && !formData.labelName.trim()) {
      errors.labelName = 'Label name is required'
    }

    if (!formData.socialLinks.trim()) {
      errors.socialLinks = 'At least one social link is required'
    } else if (!isLinkLike(formData.socialLinks)) {
      errors.socialLinks = 'Enter a valid social link (or comma-separated links)'
    }

    if (formData.freeTrial) {
      if (!formData.spotifyLink.trim()) {
        errors.spotifyLink = 'Spotify / music link is required for trial'
      } else if (!isLinkLike(formData.spotifyLink)) {
        errors.spotifyLink = 'Enter a valid Spotify / music link'
      }
    } else if (formData.spotifyLink.trim() && !isLinkLike(formData.spotifyLink)) {
      errors.spotifyLink = 'Enter a valid Spotify / music link'
    }

    return errors
  }

  const completeFreeArtistSignup = async () => {
    const errors = validateDetails()
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/register-free-artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'artist',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          artistName: formData.artistName,
          socialLinks: formData.socialLinks,
          spotifyLink: formData.spotifyLink,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rdistro.net'
      const txnId = data.txnId || `FREE-ARTIST-${Date.now()}`
      const url = new URL(`${baseUrl}/success`)
      url.searchParams.set('txn_id', txnId)
      url.searchParams.set('free_artist', 'true')
      url.searchParams.set('email', formData.email)
      url.searchParams.set('amount', '0')
      url.searchParams.set('currency', 'USD')
      url.searchParams.set('plan', 'artist')
      window.location.href = url.toString()
    } catch (err) {
      console.error('Free artist signup error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const goToPayment = async () => {
    const errors = validateDetails()
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (formData.plan === 'artist' && !plans.artist.requiresPayment && plans.artist.price <= 0) {
      await completeFreeArtistSignup()
      return
    }

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
          name: formData.name,
          phone: formData.phone,
          country: formData.country,
          artistName: formData.artistName,
          labelName: formData.labelName,
          socialLinks: formData.socialLinks,
          spotifyLink: formData.spotifyLink,
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
    return Object.keys(validateDetails()).length === 0
  }

  const stepIndex = ['plan', 'details', 'payment'].indexOf(step)
  const isFreeArtistFlow =
    formData.plan === 'artist' && !plans.artist.requiresPayment && plans.artist.price <= 0
  const stepLabels = isFreeArtistFlow
    ? ['Plan', 'Details']
    : ['Plan', 'Details', 'Payment']

  return (
    <div className="min-h-screen bg-[#fafafa] relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-100/40 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <AnimatedBrandLogo gradientId="signupWaveGradient" className="h-9 w-auto" />
          <Link
            href="https://portal.rdistro.net"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Already have an account? <span className="font-semibold text-black">Login</span>
          </Link>
        </div>
      </header>

      <div className="px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,440px] gap-10 lg:gap-14 items-start">
          {/* Left panel — desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block pt-4 sticky top-28"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-4">
              Get started
            </p>
            <h1 className="text-3xl xl:text-4xl font-bold text-black leading-tight mb-4 tracking-tight">
              Distribute your music to{' '}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                150+ platforms
              </span>
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-md">
              Create your account in minutes. Upload releases, track analytics, and collect royalties — all from one dashboard.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                { icon: '⚡', text: 'Live on stores in 24–48 hours' },
                { icon: '🌍', text: 'Spotify, Apple Music, TikTok & more' },
                { icon: '📊', text: 'Analytics & artist tools included' },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-gray-700">
                  <span className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg shadow-sm">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="p-5 rounded-2xl bg-white/80 border border-gray-200/80 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Alex Rivera</p>
                  <p className="text-xs text-gray-500">Independent Artist</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic leading-relaxed">
                &ldquo;Signed up in five minutes. My single was live on Spotify the next day.&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <div className="w-full max-w-xl mx-auto lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left mb-6 lg:hidden"
            >
              <h1 className="text-2xl font-bold text-black mb-1">Get Started</h1>
              <p className="text-sm text-gray-500">Distribute your music worldwide</p>
            </motion.div>

            {/* Progress */}
            <div className="flex justify-center lg:justify-start items-center gap-1 mb-6">
              {stepLabels.map((label, i) => {
                const currentIndex = step === 'plan' ? 0 : step === 'details' ? 1 : 2
                const isActive = currentIndex === i
                const isCompleted = currentIndex > i
                return (
                  <div key={label} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-black text-white'
                            : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:inline ${
                          isActive ? 'text-black' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div
                        className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 rounded-full ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <motion.div
              layout
              className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-xl shadow-black/5 overflow-hidden"
            >
            <AnimatePresence mode="wait">
              {/* Plan Selection */}
              {step === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-5 md:p-7"
                >
                  <h2 className="text-lg font-bold text-black text-center mb-5">Choose your plan</h2>

                  {trialEnabled && (
                    <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-cyan-50 border border-violet-200/60">
                      <label className="flex items-center justify-between cursor-pointer gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-black">🎁 1 Month Free Trial</p>
                          <p className="text-xs text-gray-500 mt-0.5">Label plan only · Auto-charges after 30 days</p>
                        </div>
                        <div className="relative flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={freeTrial}
                            onChange={(e) => handleFreeTrialToggle(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${freeTrial ? 'bg-black' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${freeTrial ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
                          </div>
                        </div>
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(Object.keys(plans) as Plan[]).map((planKey) => {
                      const plan = plans[planKey]
                      const isSelected = formData.plan === planKey
                      const isDisabled = freeTrial && planKey === 'artist'
                      const isLabel = planKey === 'label'

                      return (
                        <div
                          key={planKey}
                          onClick={() => !isDisabled && handlePlanSelect(planKey)}
                          className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 border-2 ${
                            isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg'
                          } ${
                            isSelected
                              ? isLabel
                                ? 'bg-black text-white border-black shadow-xl'
                                : 'bg-white border-black shadow-lg'
                              : isLabel
                                ? 'bg-gray-50 border-gray-200 hover:border-gray-400'
                                : 'bg-white border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {plan.popular && isLabel && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-3 py-0.5 text-[10px] rounded-full font-semibold whitespace-nowrap">
                              Most Popular
                            </span>
                          )}

                          {freeTrial && planKey === 'label' && (
                            <span className="absolute -top-2.5 right-3 bg-green-500 text-white px-2 py-0.5 text-[10px] rounded-full font-medium">
                              Free Trial
                            </span>
                          )}

                          <div className="absolute top-4 right-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? isLabel
                                    ? 'border-white bg-white'
                                    : 'border-black bg-black'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <span className={`text-[9px] font-bold ${isLabel ? 'text-black' : 'text-white'}`}>✓</span>
                              )}
                            </div>
                          </div>

                          <div className="text-3xl mb-3">{plan.icon}</div>
                          <h3 className={`font-bold text-lg ${isSelected && isLabel ? 'text-white' : 'text-black'}`}>
                            {plan.name}
                          </h3>
                          <p className={`text-xs mb-3 ${isSelected && isLabel ? 'text-gray-300' : 'text-gray-500'}`}>
                            {plan.description}
                          </p>

                          <div className="mb-4">
                            {freeTrial && planKey === 'label' ? (
                              <>
                                <span className="text-2xl font-bold text-green-400">$0</span>
                                <span className={`text-xs ${isSelected && isLabel ? 'text-gray-300' : 'text-gray-500'}`}> first month</span>
                                <p className={`text-xs mt-0.5 ${isSelected && isLabel ? 'text-gray-400' : 'text-gray-500'}`}>
                                  then ${plan.price}/year
                                </p>
                              </>
                            ) : plan.price === 0 ? (
                              <>
                                <span className="text-2xl font-bold text-green-600">Free</span>
                                <span className="text-xs text-gray-500"> /{plan.period}</span>
                              </>
                            ) : (
                              <>
                                <span className={`text-2xl font-bold ${isSelected && isLabel ? 'text-white' : 'text-black'}`}>
                                  ${plan.price}
                                </span>
                                <span className={`text-xs ${isSelected && isLabel ? 'text-gray-300' : 'text-gray-500'}`}>
                                  /{plan.period}
                                </span>
                              </>
                            )}
                          </div>

                          <ul className="space-y-1.5">
                            {plan.features.slice(0, 4).map((f, i) => (
                              <li
                                key={i}
                                className={`flex items-center gap-1.5 text-xs ${
                                  isSelected && isLabel ? 'text-gray-300' : 'text-gray-500'
                                }`}
                              >
                                <span className={isSelected && isLabel ? 'text-green-400' : 'text-green-500'}>✓</span>
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
                    className="w-full mt-6 py-3.5 rounded-xl font-semibold bg-black text-white hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black"
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
                  className="p-5 md:p-7"
                >
                  <button
                    onClick={() => setStep('plan')}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-black mb-4 transition-colors"
                  >
                    ← Back to plans
                  </button>

                  <h2 className="text-lg font-bold text-black mb-5">Your details</h2>

                  {formData.freeTrial && (
                    <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-sm font-semibold text-green-700">🎁 1 Month Free Trial</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        Your card will be charged ${plans.label.price}/year after 30 days
                      </p>
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
                        {validationErrors.name && (
                          <p className="text-[10px] text-error mt-1">{validationErrors.name}</p>
                        )}
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
                        {validationErrors.email && (
                          <p className="text-[10px] text-error mt-1">{validationErrors.email}</p>
                        )}
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
                        {validationErrors.phone && (
                          <p className="text-[10px] text-error mt-1">{validationErrors.phone}</p>
                        )}
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
                        {validationErrors.country && (
                          <p className="text-[10px] text-error mt-1">{validationErrors.country}</p>
                        )}
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
                      {formData.plan === 'artist' && validationErrors.artistName && (
                        <p className="text-[10px] text-error mt-1">{validationErrors.artistName}</p>
                      )}
                      {formData.plan === 'label' && validationErrors.labelName && (
                        <p className="text-[10px] text-error mt-1">{validationErrors.labelName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text)] mb-1">
                        Social Links * <span className="text-[var(--text-muted)] font-normal">(Required)</span>
                      </label>
                      <input
                        type="text"
                        name="socialLinks"
                        value={formData.socialLinks}
                        onChange={handleInputChange}
                        placeholder="facebook.com/yourpage, instagram.com/yourhandle"
                        className="input-field text-sm py-2.5"
                      />
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Enter at least one social link (you can add multiple, comma-separated)
                      </p>
                      {validationErrors.socialLinks && (
                        <p className="text-[10px] text-error mt-1">{validationErrors.socialLinks}</p>
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
                        {validationErrors.spotifyLink && (
                          <p className="text-[10px] text-error mt-1">{validationErrors.spotifyLink}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                      ⚠ {error}
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-gray-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{formData.plan && plans[formData.plan].icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-black truncate">
                          {formData.plan && plans[formData.plan].name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formData.freeTrial
                            ? '$0 first month'
                            : formData.plan === 'artist' && !plans.artist.requiresPayment
                              ? 'Free · no credit card'
                              : `$${formData.plan && plans[formData.plan].price}/yr`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={goToPayment}
                      disabled={!isDetailsValid() || isLoading}
                      className="shrink-0 px-6 py-3 rounded-xl font-semibold bg-black text-white hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading
                        ? '...'
                        : isFreeArtistFlow
                          ? 'Complete Signup'
                          : 'Continue'}
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
                  className="p-5 md:p-7"
                >
                  <button
                    onClick={() => setStep('details')}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-black mb-4 transition-colors"
                  >
                    ← Back to details
                  </button>

                  <h2 className="text-lg font-bold text-black mb-5">
                    {formData.freeTrial ? 'Start free trial' : 'Payment'}
                  </h2>

                  {formData.freeTrial && (
                    <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-sm font-semibold text-green-700">🎁 1 Month Free Trial</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        You won&apos;t be charged today. Card charged ${plans.label.price} after 30 days.
                      </p>
                    </div>
                  )}

                  <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{formData.plan && plans[formData.plan].icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-black">{formData.plan && plans[formData.plan].name}</p>
                        <p className="text-xs text-gray-500">
                          {formData.freeTrial ? '30-day free trial' : 'Annual subscription'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {formData.freeTrial ? (
                        <>
                          <p className="text-2xl font-bold text-green-600">$0</p>
                          <p className="text-xs text-gray-500">today</p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold text-black">
                          ${formData.plan && plans[formData.plan].price}
                        </p>
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
                          colorPrimary: '#000000',
                          borderRadius: '12px',
                          fontFamily: 'Inter, sans-serif',
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      formData={formData}
                      paymentType={paymentType}
                      artistPrice={plans.artist.price}
                      labelPrice={plans.label.price}
                    />
                  </Elements>
                </motion.div>
              )}

              {/* Payment Error State */}
              {step === 'payment' && !clientSecret && (
                <motion.div
                  key="payment-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-7 text-center"
                >
                  <p className="text-red-600 mb-4">Payment initialization failed</p>
                  <button
                    onClick={() => setStep('details')}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:border-black hover:text-black transition-colors"
                  >
                    Go Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>

            <p className="text-center lg:text-left text-xs text-gray-400 mt-5">
              By continuing, you agree to our{' '}
              <Link href="#" className="underline hover:text-gray-600">Terms</Link>
              {' & '}
              <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
