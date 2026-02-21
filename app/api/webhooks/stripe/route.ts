import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { getDatabase } from '@/lib/mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

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
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent)
        break

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
  const name = subscription.metadata?.name || 'Customer'

  if (email) {
    await db.collection('registrations').updateOne(
      { email },
      { $set: { subscriptionStatus: 'cancelled' } }
    )

    // Send cancellation email to customer
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('RESEND_API_KEY not configured, skipping email')
        return
      }
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'RDistro <registration@rdistro.net>',
        to: email,
        subject: 'Your RDistro Subscription Has Been Cancelled',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">RDistro</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 32px 40px;">
                        <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #1f2937; text-align: center;">
                          Subscription Cancelled
                        </h2>
                        
                        <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.7;">
                          Hi ${name},
                        </p>
                        
                        <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.7;">
                          Your RDistro subscription has been cancelled. We're sorry to see you go.
                        </p>
                        
                        <!-- Info Box -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                          <tr>
                            <td style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px;">
                              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400e;">What This Means</p>
                              <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">
                                Your releases will remain on streaming platforms until the end of your current billing period. After that, they may be taken down.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Reactivate Box -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                          <tr>
                            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
                              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1e40af;">Want to Come Back?</p>
                              <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">
                                You can reactivate your subscription at any time by visiting <a href="https://rdistro.net/signup" style="color: #7c3aed; text-decoration: none; font-weight: 600;">rdistro.net/signup</a> or contacting our support team.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7;">
                          Thank you for being part of RDistro. We hope to see you again!
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">
                          The RDistro Team
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Bottom Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 13px; color: #6b7280;">
                          Questions? Contact us at <a href="mailto:support@rdistro.net" style="color: #7c3aed; text-decoration: none;">support@rdistro.net</a>
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      })
      console.log('Cancellation email sent to:', email)
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
    }

    // Notify admin
    await sendAdminNotification(
      'Subscription Cancelled',
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
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email')
      return
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
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
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email')
      return
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
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
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email')
      return
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
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

// Handle successful payment intent (initial payment)
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id)

  const db = await getDatabase()
  const metadata = paymentIntent.metadata || {}

  // Check if registration already exists
  const existingRegistration = await db.collection('registrations').findOne({
    $or: [
      { email: metadata.email?.toLowerCase() },
      { paymentIntentId: paymentIntent.id },
    ],
  })

  if (existingRegistration) {
    console.log('Registration already exists for payment intent:', paymentIntent.id)
    // Update payment status if needed
    await db.collection('registrations').updateOne(
      { _id: existingRegistration._id },
      {
        $set: {
          paymentStatus: 'succeeded',
          paymentIntentId: paymentIntent.id,
        },
      }
    )
    return
  }

  // If we have all required metadata, create registration
  if (metadata.email && metadata.name && metadata.plan) {
    try {
      const registration = {
        plan: metadata.plan as 'artist' | 'label',
        name: metadata.name,
        email: metadata.email.toLowerCase(),
        phone: metadata.phone || '',
        country: metadata.country || '',
        artistName: metadata.artistName || metadata.artist_name || '',
        labelName: metadata.labelName || metadata.label_name || '',
        socialLinks: metadata.socialLinks || metadata.social_links || '',
        spotifyLink: metadata.spotifyLink || metadata.spotify_link || '',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        freeTrial: metadata.freeTrial === 'true' || false,
        trialEndDate: metadata.trialEndDate || null,
        paymentStatus: 'succeeded' as const,
        id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString(),
        accountCreated: false,
      }

      await db.collection('registrations').insertOne(registration)
      console.log('Registration created from webhook for:', metadata.email)

      // Send notification emails
      await sendRegistrationEmails(registration, false)
    } catch (error) {
      console.error('Error creating registration from payment intent webhook:', error)
    }
  } else {
    console.log('Missing metadata in payment intent:', paymentIntent.id, 'Metadata:', metadata)
    // Try to get customer info from Stripe
    if (paymentIntent.customer) {
      try {
        const customer = await stripe.customers.retrieve(paymentIntent.customer as string)
        if (!('deleted' in customer) && customer.email) {
          // Check if registration exists by email
          const existing = await db.collection('registrations').findOne({
            email: customer.email.toLowerCase(),
          })
          if (!existing) {
            console.log('Customer found but no registration. Customer email:', customer.email)
            // Could send admin notification here
          }
        }
      } catch (err) {
        console.error('Error retrieving customer:', err)
      }
    }
  }
}

// Handle successful setup intent (trial setup)
async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  console.log('Setup intent succeeded:', setupIntent.id)

  const db = await getDatabase()
  const metadata = setupIntent.metadata || {}

  // Check if registration already exists
  const existingRegistration = await db.collection('registrations').findOne({
    $or: [
      { email: metadata.email?.toLowerCase() },
      { paymentIntentId: setupIntent.id },
    ],
  })

  if (existingRegistration) {
    console.log('Registration already exists for setup intent:', setupIntent.id)
    // Update payment status if needed
    await db.collection('registrations').updateOne(
      { _id: existingRegistration._id },
      {
        $set: {
          paymentStatus: 'trial',
          paymentIntentId: setupIntent.id,
        },
      }
    )
    return
  }

  // If we have all required metadata, create registration
  if (metadata.email && metadata.name && metadata.plan) {
    try {
      const trialEndDate = metadata.trialEndDate
        ? metadata.trialEndDate
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const registration = {
        plan: metadata.plan as 'artist' | 'label',
        name: metadata.name,
        email: metadata.email.toLowerCase(),
        phone: metadata.phone || '',
        country: metadata.country || '',
        artistName: metadata.artistName || metadata.artist_name || '',
        labelName: metadata.labelName || metadata.label_name || '',
        socialLinks: metadata.socialLinks || metadata.social_links || '',
        spotifyLink: metadata.spotifyLink || metadata.spotify_link || '',
        paymentIntentId: setupIntent.id,
        amount: 0,
        freeTrial: true,
        trialEndDate,
        paymentStatus: 'trial' as const,
        id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString(),
        accountCreated: false,
      }

      await db.collection('registrations').insertOne(registration)
      console.log('Registration created from webhook (trial) for:', metadata.email)

      // Send notification emails
      await sendRegistrationEmails(registration, true)
    } catch (error) {
      console.error('Error creating registration from setup intent webhook:', error)
    }
  } else {
    console.log('Missing metadata in setup intent:', setupIntent.id, 'Metadata:', metadata)
  }
}

// Helper to send registration emails (extracted from send-notification route)
async function sendRegistrationEmails(registration: any, isTrial: boolean) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    console.log('Email service not configured, skipping emails')
    return
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const planName = registration.plan === 'artist' ? 'Artist' : 'Label'
    const entityName = registration.plan === 'artist' ? registration.artistName : registration.labelName

    // Send admin email (simplified version)
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: process.env.ADMIN_EMAIL,
      subject: `${isTrial ? '🎁 Free Trial' : '🎵'} New ${planName}: ${entityName} ${isTrial ? '(Trial)' : `($${registration.amount})`}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New ${planName} Registration ${isTrial ? '(Free Trial)' : ''}</h2>
          <p><strong>Name:</strong> ${registration.name}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> $${registration.amount}</p>
          <p><strong>Payment ID:</strong> ${registration.paymentIntentId}</p>
          <p><a href="https://app.rdistro.com/admin">View in Admin Dashboard</a></p>
        </div>
      `,
    })

    // Send customer email (simplified version)
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: registration.email,
      subject: isTrial ? 'Your Free Trial Has Started - RDistro' : '🎉 Welcome to RDistro - Registration Successful!',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to RDistro!</h2>
          <p>Hi ${registration.name},</p>
          <p>${isTrial ? 'Your free trial has started. Your account will be set up within 24-48 hours.' : 'Thank you for your registration. Your account will be set up within 24-48 hours.'}</p>
          <p>Best regards,<br>The RDistro Team</p>
        </div>
      `,
    })

    console.log('Registration emails sent for:', registration.email)
  } catch (error) {
    console.error('Error sending registration emails:', error)
  }
}

// Helper to send admin notifications
async function sendAdminNotification(subject: string, message: string) {
  if (!process.env.ADMIN_EMAIL || !process.env.RESEND_API_KEY) return

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: process.env.ADMIN_EMAIL,
      subject: `[Admin] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #7c3aed;">${subject}</h2>
          <p>${message}</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            <a href="https://rdistro.net/admin" style="color: #7c3aed;">View Admin Dashboard</a>
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }
}
