import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { addRegistration } from '@/lib/registrations'

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set!')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    
    if (!process.env.ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not set!')
      return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const body = await request.json()
    const {
      plan,
      name,
      email,
      phone,
      country,
      artistName,
      labelName,
      socialLinks,
      spotifyLink,
      paymentIntentId,
      amount,
      freeTrial,
      trialEndDate,
    } = body

    console.log('Processing notification for:', email, 'Plan:', plan, 'FreeTrial:', freeTrial)

    // Save registration to MongoDB
    try {
      await addRegistration({
        plan,
        name,
        email,
        phone,
        country,
        artistName,
        labelName,
        socialLinks,
        spotifyLink,
        paymentIntentId,
        amount,
        freeTrial: freeTrial || false,
        trialEndDate: trialEndDate || null,
        paymentStatus: freeTrial ? 'trial' : 'succeeded',
      })
      console.log('Registration saved to MongoDB')
    } catch (dbError) {
      console.error('MongoDB save error:', dbError)
      // Continue to send emails even if DB fails
    }

    const planName = plan === 'artist' ? 'Artist' : 'Label'
    const entityName = plan === 'artist' ? artistName : labelName

    // Email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
          .header { text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
          .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .badge { display: inline-block; background: ${freeTrial ? '#10b981' : '#7c3aed'}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; margin-top: 12px; font-size: 14px; }
          .section { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0; }
          .section-title { color: #7c3aed; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-weight: 600; }
          .field { margin-bottom: 12px; }
          .field-label { color: #64748b; font-size: 12px; margin-bottom: 2px; }
          .field-value { color: #0f172a; font-size: 15px; font-weight: 500; }
          .amount { font-size: 28px; font-weight: bold; color: ${freeTrial ? '#10b981' : '#7c3aed'}; }
          .trial-note { background: #dcfce7; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-top: 16px; color: #166534; font-size: 13px; }
          .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">RDistro</div>
            <div class="badge">${freeTrial ? '🎁 Free Trial' : '🎉'} New ${planName} Registration</div>
          </div>
          
          <div class="section">
            <div class="section-title">💳 ${freeTrial ? 'Trial' : 'Payment'}</div>
            <div class="field">
              <div class="field-label">Plan</div>
              <div class="field-value">${planName} Plan ${freeTrial ? '(Free Trial)' : ''}</div>
            </div>
            <div class="field">
              <div class="field-label">${freeTrial ? 'Amount Today' : 'Amount'}</div>
              <div class="amount">$${amount}</div>
            </div>
            ${freeTrial && trialEndDate ? `
            <div class="trial-note">
              <strong>⚠️ Free Trial:</strong> Card saved. Will be charged $20 on ${new Date(trialEndDate).toLocaleDateString()}
            </div>
            ` : ''}
            <div class="field">
              <div class="field-label">${freeTrial ? 'Setup' : 'Payment'} ID</div>
              <div class="field-value" style="font-size: 11px; color: #64748b; word-break: break-all;">${paymentIntentId}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">👤 Customer</div>
            <div class="field">
              <div class="field-label">Name</div>
              <div class="field-value">${name}</div>
            </div>
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${email}</div>
            </div>
            <div class="field">
              <div class="field-label">Phone</div>
              <div class="field-value">${phone}</div>
            </div>
            <div class="field">
              <div class="field-label">Country</div>
              <div class="field-value">${country}</div>
            </div>
            <div class="field">
              <div class="field-label">${plan === 'artist' ? 'Artist' : 'Label'}</div>
              <div class="field-value" style="font-size: 18px;">${entityName}</div>
            </div>
            ${socialLinks ? `
            <div class="field">
              <div class="field-label">${freeTrial ? '📱 Facebook/Instagram (Required)' : 'Social Links'}</div>
              <div class="field-value" style="font-size: 13px;">${socialLinks}</div>
            </div>
            ` : ''}
            ${spotifyLink ? `
            <div class="field">
              <div class="field-label">🎵 Spotify/Music Link ${freeTrial ? '(Required)' : ''}</div>
              <div class="field-value" style="font-size: 13px;"><a href="${spotifyLink}" style="color: #7c3aed;">${spotifyLink}</a></div>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p><strong>Action Required:</strong> Create account for this customer</p>
            ${freeTrial ? `<p style="color: #166534; margin-top: 8px;">⚠️ Remember to charge $20 after trial ends!</p>` : ''}
            <p style="margin-top: 8px;">View all registrations at <a href="https://app.rdistro.com/admin" style="color: #7c3aed;">app.rdistro.com/admin</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send admin email
    try {
      console.log('Sending admin email to:', process.env.ADMIN_EMAIL)
      const adminResult = await resend.emails.send({
        from: 'RDistro <registration@rdistro.net>',
        to: process.env.ADMIN_EMAIL,
        subject: `${freeTrial ? '🎁 Free Trial' : '🎵'} New ${planName}: ${entityName} ${freeTrial ? '(Trial)' : `($${amount})`}`,
        html: adminEmailHtml,
      })
      console.log('Admin email result:', adminResult)
    } catch (adminEmailError) {
      console.error('Admin email error:', adminEmailError)
    }

    // Customer confirmation email
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; padding: 20px; margin: 0; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
          .logo { font-size: 24px; font-weight: bold; color: #7c3aed; text-align: center; margin-bottom: 24px; }
          .icon { text-align: center; margin-bottom: 20px; }
          .icon-circle { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; font-size: 28px; }
          .title { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #0f172a; }
          .subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px; }
          .message { color: #374151; line-height: 1.7; font-size: 15px; margin-bottom: 16px; }
          .highlight { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin: 20px 0; }
          .highlight-title { font-weight: 600; color: #166534; margin-bottom: 8px; font-size: 14px; }
          .highlight-text { color: #166534; font-size: 13px; line-height: 1.6; }
          .trial-warning { background: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 12px; margin: 20px 0; }
          .trial-warning-text { color: #92400e; font-size: 13px; }
          .summary { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
          .summary-row:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">RDistro</div>
          
          <div class="icon">
            <div class="icon-circle">${freeTrial ? '🎁' : '✓'}</div>
          </div>
          
          <h1 class="title">${freeTrial ? 'Free Trial Started!' : 'We Received Your Details!'}</h1>
          <p class="subtitle">Thank you for registering with RDistro</p>
          
          <p class="message">Hi ${name},</p>
          
          <p class="message">
            ${freeTrial 
              ? 'Your 1-month free trial has been activated! Your card has been saved and will be charged after the trial period ends.'
              : 'We have successfully received your registration and payment. Your account is now being prepared by our team.'
            }
          </p>
          
          ${freeTrial && trialEndDate ? `
          <div class="trial-warning">
            <div class="trial-warning-text">
              <strong>⚠️ Trial Information:</strong><br>
              Your card will be automatically charged <strong>$20/year</strong> on <strong>${new Date(trialEndDate).toLocaleDateString()}</strong> unless you cancel before then.
            </div>
          </div>
          ` : ''}
          
          <div class="highlight">
            <div class="highlight-title">📧 What's Next?</div>
            <div class="highlight-text">
              Your account is being set up. You will receive your account details and login credentials via email within <strong>24-48 hours</strong>.
            </div>
          </div>
          
          <div class="summary">
            <div class="summary-row">
              <span style="color: #64748b;">Plan</span>
              <span style="font-weight: 600;">${planName} ${freeTrial ? '(Free Trial)' : ''}</span>
            </div>
            <div class="summary-row">
              <span style="color: #64748b;">${plan === 'artist' ? 'Artist' : 'Label'}</span>
              <span style="font-weight: 600;">${entityName}</span>
            </div>
            <div class="summary-row">
              <span style="color: #64748b;">${freeTrial ? 'Charged Today' : 'Amount'}</span>
              <span style="font-weight: 600; color: ${freeTrial ? '#10b981' : '#0f172a'};">$${amount}${freeTrial ? '' : '/year'}</span>
            </div>
            ${freeTrial ? `
            <div class="summary-row">
              <span style="color: #64748b;">After Trial</span>
              <span style="font-weight: 600;">$20/year</span>
            </div>
            ` : ''}
          </div>
          
          <p class="message">
            Once your account is ready, you can start distributing your music to Spotify, Apple Music, and 150+ streaming platforms worldwide.
          </p>
          
          <p class="message" style="margin-top: 24px;">
            Welcome to RDistro! 🎵<br>
            <strong>The RDistro Team</strong>
          </p>
          
          <div class="footer">
            <p>© RDistro - Music Distribution</p>
            <p><a href="https://rdistro.net" style="color: #7c3aed;">rdistro.net</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send customer email
    try {
      console.log('Sending customer email to:', email)
      const customerResult = await resend.emails.send({
        from: 'RDistro <registration@rdistro.net>',
        to: email,
        subject: freeTrial ? '🎁 Your Free Trial Has Started - RDistro' : '✓ We Received Your Registration - RDistro',
        html: customerEmailHtml,
      })
      console.log('Customer email result:', customerResult)
    } catch (customerEmailError) {
      console.error('Customer email error:', customerEmailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
