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

    // Customer confirmation email - Dark mode compatible
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <!--[if mso]>
        <style type="text/css">
          .fallback-font { font-family: Arial, sans-serif !important; }
        </style>
        <![endif]-->
        <style>
          :root { color-scheme: light only; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #7c3aed !important; color: #1f2937; padding: 40px 20px; margin: 0; }
          .wrapper { max-width: 520px; margin: 0 auto; }
          .container { background-color: #ffffff !important; border-radius: 24px; padding: 40px 32px; }
          .logo-container { text-align: center; margin-bottom: 32px; }
          .logo-bars { display: inline-block; }
          .logo-bar { display: inline-block; width: 8px; border-radius: 4px; margin: 0 2px; vertical-align: bottom; }
          .logo-text { font-size: 32px; font-weight: 800; color: #7c3aed !important; margin-top: 12px; letter-spacing: -0.5px; }
          .celebration { text-align: center; margin-bottom: 24px; }
          .celebration-badge { display: inline-block; background-color: #10b981 !important; color: #ffffff !important; padding: 12px 28px; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; }
          .title { font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 8px; color: #1f2937 !important; line-height: 1.3; background-color: #ffffff !important; }
          .subtitle { text-align: center; color: #6b7280 !important; font-size: 15px; margin-bottom: 32px; background-color: #ffffff !important; }
          .greeting { color: #374151 !important; line-height: 1.8; font-size: 16px; margin-bottom: 20px; background-color: #ffffff !important; }
          .message { color: #374151 !important; line-height: 1.8; font-size: 15px; margin-bottom: 16px; background-color: #ffffff !important; }
          .card { border-radius: 16px; padding: 20px; margin: 24px 0; }
          .card-success { background-color: #dcfce7 !important; border: 2px solid #86efac; }
          .card-warning { background-color: #fef3c7 !important; border: 2px solid #fcd34d; }
          .card-info { background-color: #dbeafe !important; border: 2px solid #93c5fd; }
          .card-title { font-weight: 700; color: #1f2937 !important; margin-bottom: 10px; font-size: 16px; }
          .card-text { color: #374151 !important; font-size: 14px; line-height: 1.7; }
          .summary { background-color: #f3f4f6 !important; border-radius: 16px; padding: 24px; margin: 24px 0; border: 2px solid #e5e7eb; }
          .summary-title { font-weight: 700; color: #1f2937 !important; margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .summary-row { padding: 14px 0; font-size: 15px; border-bottom: 1px solid #d1d5db; }
          .summary-row-last { border-bottom: none; padding-bottom: 0; }
          .summary-label { color: #6b7280 !important; }
          .summary-value { font-weight: 700; color: #1f2937 !important; float: right; }
          .summary-value-highlight { font-weight: 700; color: #059669 !important; float: right; }
          .platforms { text-align: center; margin-top: 16px; }
          .platform { display: inline-block; background-color: #e5e7eb !important; color: #374151 !important; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px; }
          .signature { margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb; background-color: #ffffff !important; }
          .signature-text { color: #374151 !important; font-size: 15px; line-height: 1.6; }
          .signature-name { font-weight: 700; color: #1f2937 !important; margin-top: 8px; }
          .footer { text-align: center; margin-top: 32px; padding: 24px 0 0; border-top: 2px solid #e5e7eb; background-color: #ffffff !important; }
          .footer-logo { font-size: 20px; font-weight: 800; color: #7c3aed !important; margin-bottom: 8px; }
          .footer-text { color: #6b7280 !important; font-size: 12px; line-height: 1.8; }
          .footer-link { color: #7c3aed !important; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body style="background-color: #7c3aed !important;">
        <div class="wrapper">
          <div class="container" style="background-color: #ffffff !important;">
            <div class="logo-container">
              <!--[if mso]>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="background: #00d4ff; width: 8px; height: 30px; border-radius: 4px;"></td>
                  <td width="4"></td>
                  <td style="background: #5b21b6; width: 8px; height: 45px; border-radius: 4px;"></td>
                  <td width="4"></td>
                  <td style="background: #7c3aed; width: 8px; height: 55px; border-radius: 4px;"></td>
                  <td width="4"></td>
                  <td style="background: #a855f7; width: 8px; height: 38px; border-radius: 4px;"></td>
                  <td width="4"></td>
                  <td style="background: #ff6b35; width: 8px; height: 48px; border-radius: 4px;"></td>
                </tr>
              </table>
              <![endif]-->
              <!--[if !mso]><!-->
              <div class="logo-bars" style="height: 60px; display: flex; align-items: flex-end; justify-content: center; gap: 4px;">
                <div style="width: 8px; height: 30px; background: linear-gradient(180deg, #00d4ff, #5b21b6); border-radius: 4px;"></div>
                <div style="width: 8px; height: 45px; background: linear-gradient(180deg, #00d4ff, #5b21b6); border-radius: 4px;"></div>
                <div style="width: 8px; height: 55px; background: linear-gradient(180deg, #5b21b6, #7c3aed); border-radius: 4px;"></div>
                <div style="width: 8px; height: 38px; background: linear-gradient(180deg, #7c3aed, #a855f7); border-radius: 4px;"></div>
                <div style="width: 8px; height: 48px; background: linear-gradient(180deg, #a855f7, #ff6b35); border-radius: 4px;"></div>
              </div>
              <!--<![endif]-->
              <div class="logo-text" style="color: #7c3aed !important;">RDistro</div>
            </div>
            
            <div class="celebration">
              <span class="celebration-badge" style="background-color: #10b981 !important; color: #ffffff !important;">${freeTrial ? '🎁 FREE TRIAL ACTIVATED' : '🎉 REGISTRATION SUCCESSFUL'}</span>
            </div>
            
            <h1 class="title" style="color: #1f2937 !important; background-color: #ffffff !important;">${freeTrial ? 'Your Free Trial Has Started!' : 'Welcome to RDistro!'}</h1>
            <p class="subtitle" style="color: #6b7280 !important; background-color: #ffffff !important;">Your music distribution journey begins now</p>
            
            <p class="greeting" style="color: #374151 !important; background-color: #ffffff !important;">Hi <strong style="color: #1f2937 !important;">${name}</strong>,</p>
            
            <p class="message" style="color: #374151 !important; background-color: #ffffff !important;">
              ${freeTrial 
                ? 'Congratulations! Your 1-month free trial is now active. Your payment method has been securely saved for when the trial ends.'
                : 'Thank you for choosing RDistro! We\'ve received your registration and payment. Our team is now setting up your account.'
              }
            </p>
            
            ${freeTrial && trialEndDate ? `
            <div class="card card-warning" style="background-color: #fef3c7 !important; border: 2px solid #fcd34d; border-radius: 16px; padding: 20px;">
              <div class="card-title" style="color: #92400e !important; font-weight: 700; margin-bottom: 10px;">⏰ Trial Reminder</div>
              <div class="card-text" style="color: #78350f !important; font-size: 14px; line-height: 1.7;">
                Your card will be automatically charged <strong>$20/year</strong> on <strong>${new Date(trialEndDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. You can cancel anytime before this date.
              </div>
            </div>
            ` : ''}
            
            <div class="card card-info" style="background-color: #dbeafe !important; border: 2px solid #93c5fd; border-radius: 16px; padding: 20px;">
              <div class="card-title" style="color: #1e40af !important; font-weight: 700; margin-bottom: 10px;">📧 What Happens Next?</div>
              <div class="card-text" style="color: #1e3a8a !important; font-size: 14px; line-height: 1.7;">
                Your account is being prepared. You'll receive your <strong>login credentials</strong> and access details via email within <strong>24-48 hours</strong>.
              </div>
            </div>
            
            <div class="summary" style="background-color: #f3f4f6 !important; border: 2px solid #e5e7eb; border-radius: 16px; padding: 24px;">
              <div class="summary-title" style="color: #1f2937 !important; font-weight: 700; margin-bottom: 16px; font-size: 14px; text-transform: uppercase;">📋 Order Summary</div>
              <div class="summary-row" style="padding: 14px 0; border-bottom: 1px solid #d1d5db;">
                <span class="summary-label" style="color: #6b7280 !important;">Plan</span>
                <span class="summary-value" style="color: #1f2937 !important; font-weight: 700; float: right;">${planName} ${freeTrial ? '(Trial)' : ''}</span>
              </div>
              <div class="summary-row" style="padding: 14px 0; border-bottom: 1px solid #d1d5db;">
                <span class="summary-label" style="color: #6b7280 !important;">${plan === 'artist' ? 'Artist Name' : 'Label Name'}</span>
                <span class="summary-value" style="color: #1f2937 !important; font-weight: 700; float: right;">${entityName}</span>
              </div>
              <div class="summary-row" style="padding: 14px 0; border-bottom: ${freeTrial ? '1px solid #d1d5db' : 'none'};">
                <span class="summary-label" style="color: #6b7280 !important;">${freeTrial ? 'Today\'s Charge' : 'Amount Paid'}</span>
                <span style="color: ${freeTrial ? '#059669' : '#1f2937'} !important; font-weight: 700; float: right;">$${amount}${freeTrial ? ' (Free!)' : '/year'}</span>
              </div>
              ${freeTrial ? `
              <div class="summary-row" style="padding: 14px 0;">
                <span class="summary-label" style="color: #6b7280 !important;">After Trial</span>
                <span class="summary-value" style="color: #1f2937 !important; font-weight: 700; float: right;">$20/year</span>
              </div>
              ` : ''}
            </div>
            
            <div class="card card-success" style="background-color: #dcfce7 !important; border: 2px solid #86efac; border-radius: 16px; padding: 20px;">
              <div class="card-title" style="color: #166534 !important; font-weight: 700; margin-bottom: 10px;">🚀 Get Ready to Distribute</div>
              <div class="card-text" style="color: #15803d !important; font-size: 14px; line-height: 1.7;">
                Once your account is ready, you can distribute your music to all major streaming platforms worldwide.
              </div>
              <div class="platforms" style="text-align: center; margin-top: 16px;">
                <span style="display: inline-block; background-color: #bbf7d0 !important; color: #166534 !important; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px;">Spotify</span>
                <span style="display: inline-block; background-color: #bbf7d0 !important; color: #166534 !important; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px;">Apple Music</span>
                <span style="display: inline-block; background-color: #bbf7d0 !important; color: #166534 !important; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px;">YouTube Music</span>
                <span style="display: inline-block; background-color: #bbf7d0 !important; color: #166534 !important; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px;">Amazon</span>
                <span style="display: inline-block; background-color: #bbf7d0 !important; color: #166534 !important; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px;">+450 more</span>
              </div>
            </div>
            
            <div class="signature" style="background-color: #ffffff !important; border-top: 2px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
              <p class="signature-text" style="color: #374151 !important; font-size: 15px; line-height: 1.6;">We're excited to have you on board! If you have any questions, feel free to reach out.</p>
              <p class="signature-name" style="color: #1f2937 !important; font-weight: 700; margin-top: 8px;">🎵 The RDistro Team</p>
            </div>
            
            <div class="footer" style="background-color: #ffffff !important; border-top: 2px solid #e5e7eb; text-align: center; margin-top: 32px; padding: 24px 0 0;">
              <div class="footer-logo" style="color: #7c3aed !important; font-size: 20px; font-weight: 800; margin-bottom: 8px;">RDistro</div>
              <p class="footer-text" style="color: #6b7280 !important; font-size: 12px; line-height: 1.8;">
                Music Distribution Made Simple<br>
                <a href="https://rdistro.net" style="color: #7c3aed !important; text-decoration: none; font-weight: 600;">rdistro.net</a>
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
