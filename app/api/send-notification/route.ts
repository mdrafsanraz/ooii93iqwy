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

    // Customer confirmation email - Clean professional design
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Welcome to RDistro</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
                    <img src="https://app.rdistro.net/logo.jpg" alt="RDistro" width="120" height="120" style="display: block; margin: 0 auto 16px; border-radius: 8px;" />
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">RDistro</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #9ca3af;">Music Distribution</p>
                  </td>
                </tr>
                
                <!-- Status Badge -->
                <tr>
                  <td style="padding: 32px 40px 0; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        <td style="background-color: ${freeTrial ? '#059669' : '#7c3aed'}; color: #ffffff; padding: 10px 24px; border-radius: 50px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          ${freeTrial ? 'Free Trial Activated' : 'Registration Successful'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 32px 40px;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">
                      ${freeTrial ? 'Your Free Trial Has Started' : 'Welcome to RDistro'}
                    </h2>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; text-align: center;">
                      Your music distribution journey begins now
                    </p>
                    
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.7;">
                      Hi <strong style="color: #1f2937;">${name}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.7;">
                      ${freeTrial 
                        ? 'Your 1-month free trial is now active. Your payment method has been securely saved and will be charged automatically when the trial ends.'
                        : 'Thank you for choosing RDistro. We have received your registration and payment. Our team is now setting up your account.'
                      }
                    </p>
            
                    ${freeTrial && trialEndDate ? `
                    <!-- Trial Warning Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400e;">Trial Information</p>
                          <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">
                            Your card will be charged <strong>$20/year</strong> on <strong>${new Date(trialEndDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. You can cancel anytime before this date.
                          </p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- What's Next Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1e40af;">What Happens Next</p>
                          <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">
                            Your account is being prepared. You will receive your login credentials and access details via email within <strong>24-48 hours</strong>.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Order Summary -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Order Summary</p>
                          
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <span style="font-size: 14px; color: #6b7280;">Plan</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${planName} ${freeTrial ? '(Trial)' : ''}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <span style="font-size: 14px; color: #6b7280;">${plan === 'artist' ? 'Artist Name' : 'Label Name'}</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${entityName}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; ${freeTrial ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                                <span style="font-size: 14px; color: #6b7280;">${freeTrial ? 'Today' : 'Amount Paid'}</span>
                              </td>
                              <td style="padding: 12px 0; ${freeTrial ? 'border-bottom: 1px solid #e5e7eb;' : ''} text-align: right;">
                                <span style="font-size: 14px; font-weight: 700; color: ${freeTrial ? '#059669' : '#1f2937'};">$${amount}${freeTrial ? ' (Free)' : '/year'}</span>
                              </td>
                            </tr>
                            ${freeTrial ? `
                            <tr>
                              <td style="padding: 12px 0;">
                                <span style="font-size: 14px; color: #6b7280;">After Trial</span>
                              </td>
                              <td style="padding: 12px 0; text-align: right;">
                                <span style="font-size: 14px; font-weight: 600; color: #1f2937;">$20/year</span>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Platforms Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #166534;">Ready to Distribute</p>
                          <p style="margin: 0 0 16px; font-size: 14px; color: #15803d; line-height: 1.6;">
                            Once your account is ready, you can distribute your music to all major streaming platforms worldwide.
                          </p>
                          <p style="margin: 0; font-size: 13px; color: #166534;">
                            Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, Tidal, and 450+ more platforms
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.6;">
                      We are excited to have you on board. If you have any questions, feel free to reach out to our support team.
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">
                      The RDistro Team
                    </p>
                  </td>
                </tr>
                
                <!-- Bottom Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #1f2937;">RDistro</p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">
                      Music Distribution Made Simple<br>
                      <a href="https://rdistro.net" style="color: #7c3aed; text-decoration: none;">rdistro.net</a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Send customer email
    try {
      console.log('Sending customer email to:', email)
      const customerResult = await resend.emails.send({
        from: 'RDistro <registration@rdistro.net>',
        to: email,
        subject: freeTrial ? 'Your Free Trial Has Started - RDistro' : '🎉 Welcome to RDistro - Registration Successful!',
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
