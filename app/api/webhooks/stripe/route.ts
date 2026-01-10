import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { getDatabase } from '@/lib/mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
})

const resend = new Resend(process.env.RESEND_API_KEY)

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing signature or webhook secret')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Stripe webhook received:', event.type)

    switch (event.type) {
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

// Handle subscription status changes
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id, 'Status:', subscription.status)

  const db = await getDatabase()
  const email = subscription.metadata?.email

  if (!email) {
    console.log('No email in subscription metadata')
    return
  }

  // Update registration status based on subscription status
  if (subscription.status === 'active') {
    // Trial ended, subscription is now active (payment succeeded)
    await db.collection('registrations').updateOne(
      { email },
      { 
        $set: { 
          paymentStatus: 'succeeded',
          subscriptionStatus: 'active',
          subscriptionId: subscription.id,
        } 
      }
    )
    console.log('Registration updated to active for:', email)
  } else if (subscription.status === 'past_due') {
    await db.collection('registrations').updateOne(
      { email },
      { $set: { paymentStatus: 'failed', subscriptionStatus: 'past_due' } }
    )
  } else if (subscription.status === 'trialing') {
    await db.collection('registrations').updateOne(
      { email },
      { $set: { subscriptionStatus: 'trialing', subscriptionId: subscription.id } }
    )
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)

  const db = await getDatabase()
  const email = subscription.metadata?.email

  if (email) {
    await db.collection('registrations').updateOne(
      { email },
      { $set: { subscriptionStatus: 'cancelled' } }
    )

    // Notify admin
    await sendAdminNotification(
      '❌ Subscription Cancelled',
      `Subscription cancelled for: ${email}`
    )
  }
}

// Handle successful payment (after trial or renewal)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id, 'Amount:', invoice.amount_paid)

  // Skip $0 invoices (trial start)
  if (invoice.amount_paid === 0) {
    console.log('Skipping $0 invoice (trial)')
    return
  }

  const db = await getDatabase()
  const customerEmail = invoice.customer_email

  if (!customerEmail) {
    console.log('No customer email on invoice')
    return
  }

  // Update registration
  await db.collection('registrations').updateOne(
    { email: customerEmail },
    { 
      $set: { 
        paymentStatus: 'succeeded',
        lastPaymentDate: new Date().toISOString(),
        lastPaymentAmount: invoice.amount_paid / 100,
      } 
    }
  )

  // Send confirmation email to customer
  try {
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: customerEmail,
      subject: '✅ Payment Successful - RDistro Subscription',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
            .logo { font-size: 24px; font-weight: bold; color: #7c3aed; text-align: center; margin-bottom: 24px; }
            .icon { text-align: center; font-size: 48px; margin-bottom: 16px; }
            .title { font-size: 22px; font-weight: bold; text-align: center; color: #0f172a; margin-bottom: 8px; }
            .amount { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; margin: 24px 0; }
            .message { color: #64748b; line-height: 1.6; text-align: center; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">RDistro</div>
            <div class="icon">✅</div>
            <h1 class="title">Payment Successful!</h1>
            <div class="amount">$${(invoice.amount_paid / 100).toFixed(2)}</div>
            <p class="message">
              Your subscription payment was successful. Your RDistro account remains active for another year.
            </p>
            <p class="message" style="margin-top: 16px;">
              Thank you for continuing with RDistro! 🎵
            </p>
            <div class="footer">
              <p>© RDistro - Music Distribution</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    console.log('Payment confirmation email sent to:', customerEmail)
  } catch (emailError) {
    console.error('Failed to send payment email:', emailError)
  }

  // Notify admin
  await sendAdminNotification(
    '💰 Payment Received',
    `Payment of $${(invoice.amount_paid / 100).toFixed(2)} received from ${customerEmail}`
  )
}

// Handle failed payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)

  const db = await getDatabase()
  const customerEmail = invoice.customer_email

  if (!customerEmail) return

  // Update registration
  await db.collection('registrations').updateOne(
    { email: customerEmail },
    { $set: { paymentStatus: 'failed' } }
  )

  // Send failure notification to customer
  try {
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: customerEmail,
      subject: '⚠️ Payment Failed - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
            .logo { font-size: 24px; font-weight: bold; color: #7c3aed; text-align: center; margin-bottom: 24px; }
            .icon { text-align: center; font-size: 48px; margin-bottom: 16px; }
            .title { font-size: 22px; font-weight: bold; text-align: center; color: #ef4444; margin-bottom: 8px; }
            .message { color: #64748b; line-height: 1.6; }
            .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 12px; margin: 20px 0; color: #991b1b; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">RDistro</div>
            <div class="icon">⚠️</div>
            <h1 class="title">Payment Failed</h1>
            <p class="message">
              We were unable to process your subscription payment. Please update your payment method to continue using RDistro.
            </p>
            <div class="warning">
              <strong>Action Required:</strong> Your account access may be limited until payment is resolved.
            </div>
            <p class="message">
              Please contact us at <a href="mailto:support@rdistro.net" style="color: #7c3aed;">support@rdistro.net</a> if you need assistance.
            </p>
            <div class="footer">
              <p>© RDistro - Music Distribution</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (emailError) {
    console.error('Failed to send failure email:', emailError)
  }

  // Notify admin
  await sendAdminNotification(
    '❌ Payment Failed',
    `Payment failed for ${customerEmail}. Invoice: ${invoice.id}`
  )
}

// Handle trial ending soon (3 days before)
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial will end soon:', subscription.id)

  const email = subscription.metadata?.email
  if (!email) return

  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'soon'

  // Send reminder email
  try {
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: email,
      subject: '⏰ Your Free Trial Ends Soon - RDistro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
            .logo { font-size: 24px; font-weight: bold; color: #7c3aed; text-align: center; margin-bottom: 24px; }
            .icon { text-align: center; font-size: 48px; margin-bottom: 16px; }
            .title { font-size: 22px; font-weight: bold; text-align: center; color: #0f172a; margin-bottom: 8px; }
            .date { font-size: 18px; font-weight: bold; color: #f59e0b; text-align: center; margin: 16px 0; }
            .message { color: #64748b; line-height: 1.6; }
            .info { background: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 12px; margin: 20px 0; color: #92400e; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">RDistro</div>
            <div class="icon">⏰</div>
            <h1 class="title">Your Free Trial Ends Soon!</h1>
            <div class="date">Trial ends: ${trialEnd}</div>
            <p class="message">
              Your 30-day free trial is coming to an end. After this date, your card will be charged <strong>$20/year</strong> to continue your RDistro subscription.
            </p>
            <div class="info">
              <strong>What happens next:</strong><br>
              Your saved card will be automatically charged. No action needed if you want to continue!
            </div>
            <p class="message">
              If you wish to cancel, please contact us before your trial ends.
            </p>
            <div class="footer">
              <p>© RDistro - Music Distribution</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    console.log('Trial ending reminder sent to:', email)
  } catch (emailError) {
    console.error('Failed to send trial reminder:', emailError)
  }

  // Notify admin
  await sendAdminNotification(
    '⏰ Trial Ending Soon',
    `Trial ending in 3 days for: ${email}`
  )
}

// Helper to send admin notifications
async function sendAdminNotification(subject: string, message: string) {
  if (!process.env.ADMIN_EMAIL) return

  try {
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: process.env.ADMIN_EMAIL,
      subject: `[Admin] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #7c3aed;">${subject}</h2>
          <p>${message}</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            <a href="https://app.rdistro.net/admin" style="color: #7c3aed;">View Admin Dashboard</a>
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }
}

