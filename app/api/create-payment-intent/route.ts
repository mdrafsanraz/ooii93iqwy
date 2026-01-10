import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment system not configured - missing secret key' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    })

    const body = await request.json()
    const { plan, email } = body

    console.log('Creating payment intent for:', { plan, email })

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
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Payment failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
