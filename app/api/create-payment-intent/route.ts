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

    // For free trial, create a subscription with trial period
    if (freeTrial && plan === 'label') {
      // First, get or create a price for the label subscription
      let priceId = process.env.STRIPE_LABEL_PRICE_ID

      if (!priceId) {
        // Create a product and price if not exists
        const product = await stripe.products.create({
          name: 'RDistro Label Plan',
          description: 'Annual label distribution plan',
        })

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 2000, // $20.00
          currency: 'usd',
          recurring: {
            interval: 'year',
          },
        })

        priceId = price.id
        console.log('Created new price:', priceId)
      }

      // Create a customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          plan: 'label',
          freeTrial: 'true',
        },
      })

      // Create a subscription with 30-day trial
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        trial_period_days: 30,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
        metadata: {
          plan: 'label',
          freeTrial: 'true',
          email,
        },
      })

      console.log('Created subscription with trial:', subscription.id)

      // Get the client secret for SetupIntent (for trial) or PaymentIntent
      let clientSecret: string | null = null

      if (subscription.pending_setup_intent) {
        const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent
        clientSecret = setupIntent.client_secret
      } else if (subscription.latest_invoice) {
        const invoice = subscription.latest_invoice as Stripe.Invoice
        if (invoice.payment_intent) {
          const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
          clientSecret = paymentIntent.client_secret
        }
      }

      if (!clientSecret) {
        // Fallback: Create a SetupIntent for the customer
        const setupIntent = await stripe.setupIntents.create({
          customer: customer.id,
          payment_method_types: ['card'],
          metadata: {
            subscription_id: subscription.id,
            plan: 'label',
            freeTrial: 'true',
          },
        })
        clientSecret = setupIntent.client_secret
      }

      return NextResponse.json({
        clientSecret,
        type: 'subscription',
        subscriptionId: subscription.id,
        customerId: customer.id,
        trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    // Regular one-time payment for non-trial
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
