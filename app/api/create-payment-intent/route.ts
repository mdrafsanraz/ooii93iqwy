import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { emailExists } from '@/lib/registrations'
import { getDatabase } from '@/lib/mongodb'

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

    const isValidUrl = (value?: string) => {
      if (!value) return true
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }

    if (!isValidUrl(socialLinks)) {
      return NextResponse.json(
        { error: 'Invalid social links URL' },
        { status: 400 }
      )
    }

    if (!isValidUrl(spotifyLink)) {
      return NextResponse.json(
        { error: 'Invalid Spotify / music link URL' },
        { status: 400 }
      )
    }

    // Guard: Artist plan might be temporarily free (no credit card required)
    if (plan === 'artist') {
      try {
        const db = await getDatabase()
        const settings = await db.collection('settings').findOne({ settingsId: 'app_settings' })
        const artistPlanMode = settings?.artistPlanMode === 'paid' ? 'paid' : 'free'
        if (artistPlanMode === 'free') {
          return NextResponse.json(
            { error: 'Artist plan is currently free. No payment is required.' },
            { status: 400 }
          )
        }
      } catch (settingsError) {
        // If settings lookup fails, default to free to avoid charging unexpectedly.
        console.error('Settings lookup error (artist plan mode):', settingsError)
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

    // Get or create price IDs for subscriptions
    let priceId: string | undefined

    if (plan === 'artist') {
      priceId = process.env.STRIPE_ARTIST_PRICE_ID
      
      if (!priceId) {
        // Create Artist product and price if not exists
        const product = await stripe.products.create({
          name: 'RDistro Artist Plan',
          description: 'Annual artist distribution plan - $5/year',
        })
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 500, // $5.00
          currency: 'usd',
          recurring: { interval: 'year' },
        })
        priceId = price.id
        console.log('Created Artist price:', priceId)
      }
    } else if (plan === 'label') {
      priceId = process.env.STRIPE_LABEL_PRICE_ID
      
      if (!priceId) {
        // Create Label product and price if not exists
        const product = await stripe.products.create({
          name: 'RDistro Label Plan',
          description: 'Annual label distribution plan - $20/year',
        })
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 2000, // $20.00
          currency: 'usd',
          recurring: { interval: 'year' },
        })
        priceId = price.id
        console.log('Created Label price:', priceId)
      }
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price configuration error' },
        { status: 500 }
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
      amount: plan === 'artist' ? 5 : 20,
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
