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

    // Customer confirmation email - Modern design with logo
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #0f172a; padding: 40px 20px; margin: 0; }
          .wrapper { max-width: 520px; margin: 0 auto; }
          .container { background: #ffffff; border-radius: 24px; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
          .logo-container { text-align: center; margin-bottom: 32px; }
          .logo-svg { width: 80px; height: 80px; }
          .logo-text { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #00d4ff, #5b21b6, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-top: 12px; letter-spacing: -0.5px; }
          .celebration { text-align: center; margin-bottom: 24px; }
          .celebration-badge { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 10px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; }
          .title { font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 8px; color: #0f172a; line-height: 1.3; }
          .subtitle { text-align: center; color: #64748b; font-size: 15px; margin-bottom: 32px; }
          .greeting { color: #374151; line-height: 1.8; font-size: 16px; margin-bottom: 20px; }
          .message { color: #374151; line-height: 1.8; font-size: 15px; margin-bottom: 16px; }
          .card { border-radius: 16px; padding: 20px; margin: 24px 0; }
          .card-success { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #a7f3d0; }
          .card-warning { background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fcd34d; }
          .card-info { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #7dd3fc; }
          .card-title { font-weight: 700; color: #0f172a; margin-bottom: 8px; font-size: 15px; display: flex; align-items: center; gap: 8px; }
          .card-text { color: #475569; font-size: 14px; line-height: 1.6; }
          .summary { background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
          .summary-title { font-weight: 700; color: #0f172a; margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; }
          .summary-row:last-child { border-bottom: none; padding-bottom: 0; }
          .summary-label { color: #64748b; }
          .summary-value { font-weight: 600; color: #0f172a; }
          .summary-value-highlight { font-weight: 700; color: #10b981; }
          .cta-section { text-align: center; margin: 32px 0; }
          .cta-text { color: #64748b; font-size: 14px; margin-bottom: 16px; }
          .platforms { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
          .platform { background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
          .signature { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
          .signature-text { color: #374151; font-size: 15px; line-height: 1.6; }
          .signature-name { font-weight: 700; color: #0f172a; margin-top: 8px; }
          .footer { text-align: center; margin-top: 32px; padding: 24px 0 0; border-top: 1px solid #e2e8f0; }
          .footer-logo { font-size: 18px; font-weight: 700; color: #7c3aed; margin-bottom: 8px; }
          .footer-text { color: #94a3b8; font-size: 12px; line-height: 1.8; }
          .footer-link { color: #7c3aed; text-decoration: none; font-weight: 500; }
          .wave-bars { display: flex; justify-content: center; align-items: flex-end; gap: 4px; height: 40px; margin-bottom: 8px; }
          .wave-bar { width: 6px; background: linear-gradient(to top, #00d4ff, #5b21b6, #ff6b35); border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="logo-container">
              <div class="wave-bars">
                <div class="wave-bar" style="height: 20px;"></div>
                <div class="wave-bar" style="height: 30px;"></div>
                <div class="wave-bar" style="height: 40px;"></div>
                <div class="wave-bar" style="height: 24px;"></div>
                <div class="wave-bar" style="height: 36px;"></div>
              </div>
              <div class="logo-text">RDistro</div>
            </div>
            
            <div class="celebration">
              <span class="celebration-badge">${freeTrial ? '🎁 FREE TRIAL ACTIVATED' : '🎉 REGISTRATION SUCCESSFUL'}</span>
            </div>
            
            <h1 class="title">${freeTrial ? 'Your Free Trial Has Started!' : 'Welcome to RDistro!'}</h1>
            <p class="subtitle">Your music distribution journey begins now</p>
            
            <p class="greeting">Hi <strong>${name}</strong>,</p>
            
            <p class="message">
              ${freeTrial 
                ? 'Congratulations! Your 1-month free trial is now active. Your payment method has been securely saved for when the trial ends.'
                : 'Thank you for choosing RDistro! We\'ve received your registration and payment. Our team is now setting up your account.'
              }
            </p>
            
            ${freeTrial && trialEndDate ? `
            <div class="card card-warning">
              <div class="card-title">⏰ Trial Reminder</div>
              <div class="card-text">
                Your card will be automatically charged <strong>$20/year</strong> on <strong>${new Date(trialEndDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. You can cancel anytime before this date.
              </div>
            </div>
            ` : ''}
            
            <div class="card card-info">
              <div class="card-title">📧 What Happens Next?</div>
              <div class="card-text">
                Your account is being prepared. You'll receive your <strong>login credentials</strong> and access details via email within <strong>24-48 hours</strong>.
              </div>
            </div>
            
            <div class="summary">
              <div class="summary-title">📋 Order Summary</div>
              <div class="summary-row">
                <span class="summary-label">Plan</span>
                <span class="summary-value">${planName} ${freeTrial ? '(Trial)' : ''}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">${plan === 'artist' ? 'Artist Name' : 'Label Name'}</span>
                <span class="summary-value">${entityName}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">${freeTrial ? 'Today\'s Charge' : 'Amount Paid'}</span>
                <span class="${freeTrial ? 'summary-value-highlight' : 'summary-value'}">$${amount}${freeTrial ? ' (Free!)' : '/year'}</span>
              </div>
              ${freeTrial ? `
              <div class="summary-row">
                <span class="summary-label">After Trial</span>
                <span class="summary-value">$20/year</span>
              </div>
              ` : ''}
            </div>
            
            <div class="card card-success">
              <div class="card-title">🚀 Get Ready to Distribute</div>
              <div class="card-text">
                Once your account is ready, you can distribute your music to all major streaming platforms worldwide.
              </div>
              <div class="platforms">
                <span class="platform">Spotify</span>
                <span class="platform">Apple Music</span>
                <span class="platform">YouTube Music</span>
                <span class="platform">Amazon</span>
                <span class="platform">+150 more</span>
              </div>
            </div>
            
            <div class="signature">
              <p class="signature-text">We're excited to have you on board! If you have any questions, feel free to reach out.</p>
              <p class="signature-name">🎵 The RDistro Team</p>
            </div>
            
            <div class="footer">
              <div class="footer-logo">RDistro</div>
              <p class="footer-text">
                Music Distribution Made Simple<br>
                <a href="https://rdistro.net" class="footer-link">rdistro.net</a>
              </p>
            </div>
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
        subject: freeTrial ? '🎁 Your Free Trial Has Started - RDistro' : '🎉 Welcome to RDistro - Registration Successful!',
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
