import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { emailExists } from '@/lib/registrations'
import { getActivePlan } from '@/lib/plans'
import { getOrCreateStripePriceForPlan } from '@/lib/stripePlans'

function hasValidLinks(value?: string) {
  if (!value || !value.trim()) return false
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

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })

    const body = await request.json()
    const { 
      plan, 
      email, 
      freeTrial,
      name,
      phone,
      country,
      artistName,
      labelName,
      socialLinks,
      spotifyLink,
    } = body

    console.log('Payment request:', { plan, email, freeTrial })

    if (!plan || !['artist', 'label'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!socialLinks?.trim()) {
      return NextResponse.json(
        { error: 'Social links are required' },
        { status: 400 }
      )
    }

    if (!hasValidLinks(socialLinks)) {
      return NextResponse.json(
        { error: 'Invalid social links URL' },
        { status: 400 }
      )
    }

    if (spotifyLink && !hasValidLinks(spotifyLink)) {
      return NextResponse.json(
        { error: 'Invalid Spotify / music link URL' },
        { status: 400 }
      )
    }

    // Guard: Artist plan might be temporarily free (no credit card required)
    if (plan === 'artist') {
      try {
        const activeArtistPlan = await getActivePlan('artist')
        if (!activeArtistPlan?.requiresPayment || activeArtistPlan.price <= 0) {
          return NextResponse.json(
            { error: 'Artist plan is currently free. No payment is required.' },
            { status: 400 }
          )
        }
      } catch (settingsError) {
        console.error('Active plan lookup error (artist):', settingsError)
        return NextResponse.json(
          { error: 'Artist plan is currently free. No payment is required.' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate registration
    try {
      const exists = await emailExists(email)
      if (exists) {
        console.log('Duplicate registration attempt:', email)
        return NextResponse.json(
          { error: 'This email is already registered. Please use a different email or contact support.' },
          { status: 409 }
        )
      }
    } catch (dbError) {
      console.error('Database check error:', dbError)
      // Continue with registration if DB check fails (to not block users)
    }

    // Resolve Stripe price from the active plan (creates one if missing)
    const activePlan = await getActivePlan(plan)
    const planAmount = activePlan?.price ?? (plan === 'artist' ? 5 : 20)

    if (!activePlan) {
      return NextResponse.json({ error: 'No active plan found for checkout' }, { status: 400 })
    }

    let priceId: string | null = null
    try {
      priceId = await getOrCreateStripePriceForPlan(activePlan)
    } catch (stripePlanError) {
      console.error('Stripe plan price error:', stripePlanError)
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'This plan does not require payment' },
        { status: 400 }
      )
    }

    // Create a customer with full metadata
    const customer = await stripe.customers.create({
      email,
      metadata: {
        plan,
        freeTrial: freeTrial ? 'true' : 'false',
        name: name || '',
        phone: phone || '',
        country: country || '',
        artistName: artistName || '',
        labelName: labelName || '',
        socialLinks: socialLinks || '',
        spotifyLink: spotifyLink || '',
      },
    })

    // Create subscription - with trial for Label free trial, without for direct purchase
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      metadata: {
        plan,
        freeTrial: freeTrial ? 'true' : 'false',
        email,
        name: name || '',
        phone: phone || '',
        country: country || '',
        artistName: artistName || '',
        labelName: labelName || '',
        socialLinks: socialLinks || '',
        spotifyLink: spotifyLink || '',
        trialEndDate: freeTrial && plan === 'label'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      },
    }

    // Add 30-day trial only for Label free trial
    if (freeTrial && plan === 'label') {
      subscriptionParams.trial_period_days = 30
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams)

    console.log('Created subscription:', subscription.id, 'Status:', subscription.status)

    // Get the client secret and add metadata to payment/setup intents
    let clientSecret: string | null = null
    let paymentType = 'payment'
    const customerMetadata = {
      subscription_id: subscription.id,
      plan,
      freeTrial: freeTrial ? 'true' : 'false',
      email,
      name: name || '',
      phone: phone || '',
      country: country || '',
      artistName: artistName || '',
      labelName: labelName || '',
      socialLinks: socialLinks || '',
      spotifyLink: spotifyLink || '',
      trialEndDate: freeTrial && plan === 'label'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    }

    if (subscription.pending_setup_intent) {
      // Trial subscription - needs SetupIntent
      const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent
      // Update setup intent with metadata
      await stripe.setupIntents.update(setupIntent.id, {
        metadata: customerMetadata,
      })
      clientSecret = setupIntent.client_secret
      paymentType = 'setup'
    } else if (subscription.latest_invoice) {
      // Paid subscription - needs PaymentIntent
      const invoice = subscription.latest_invoice as Stripe.Invoice
      if (invoice.payment_intent) {
        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
        // Update payment intent with metadata
        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: customerMetadata,
        })
        clientSecret = paymentIntent.client_secret
        paymentType = 'payment'
      }
    }

    if (!clientSecret) {
      // Fallback: Create a SetupIntent for the customer
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ['card'],
        metadata: customerMetadata,
      })
      clientSecret = setupIntent.client_secret
      paymentType = 'setup'
    }

    const trialEnd = freeTrial && plan === 'label'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null

    return NextResponse.json({
      clientSecret,
      type: paymentType,
      subscriptionId: subscription.id,
      customerId: customer.id,
      trialEnd,
      plan,
      amount: planAmount,
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Payment failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
