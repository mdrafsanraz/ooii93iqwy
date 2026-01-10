import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
      apiVersion: '2024-04-10',
    })

    const body = await request.json()
    const { plan, email, freeTrial } = body

    console.log('Payment request:', { plan, email, freeTrial })

    const PLAN_PRICES: Record<string, number> = {
      artist: 500, // $5.00 in cents
      label: 2000, // $20.00 in cents
    }

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // For free trial, we use SetupIntent to save card for future charging
    if (freeTrial && plan === 'label') {
      // Create a SetupIntent to collect card details for future payment
      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ['card'],
        metadata: {
          plan,
          email,
          freeTrial: 'true',
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
      })

      console.log('Setup intent created for free trial:', setupIntent.id)

      return NextResponse.json({
        clientSecret: setupIntent.client_secret,
        type: 'setup',
      })
    }

    // Regular payment intent for non-trial
    const amount = PLAN_PRICES[plan]

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: email,
      metadata: {
        plan,
        email,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('Payment intent created:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      type: 'payment',
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
