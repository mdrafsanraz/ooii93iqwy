import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const testEmail = 'mdrafsanraz@gmail.com'
    
    // Test data
    const name = 'Rafsan'
    const planName = 'Artist'
    const entityName = 'Rafsan Music'
    const amount = 5
    const freeTrial = false
    const plan = 'artist'

    // Customer confirmation email template
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
                        <td style="background-color: #7c3aed; color: #ffffff; padding: 10px 24px; border-radius: 50px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Registration Successful
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 32px 40px;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">
                      Welcome to RDistro
                    </h2>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; text-align: center;">
                      Your music distribution journey begins now
                    </p>
                    
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.7;">
                      Hi <strong style="color: #1f2937;">${name}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.7;">
                      Thank you for choosing RDistro. We have received your registration and payment. Our team is now setting up your account.
                    </p>
                    
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
                                <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${planName}</span>
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
                              <td style="padding: 12px 0;">
                                <span style="font-size: 14px; color: #6b7280;">Amount Paid</span>
                              </td>
                              <td style="padding: 12px 0; text-align: right;">
                                <span style="font-size: 14px; font-weight: 700; color: #1f2937;">$${amount}/year</span>
                              </td>
                            </tr>
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

    // Free Trial email template
    const trialEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Free Trial Started - RDistro</title>
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
                        <td style="background-color: #059669; color: #ffffff; padding: 10px 24px; border-radius: 50px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Free Trial Activated
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 32px 40px;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">
                      Your Free Trial Has Started
                    </h2>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; text-align: center;">
                      Your music distribution journey begins now
                    </p>
                    
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.7;">
                      Hi <strong style="color: #1f2937;">Rafsan</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.7;">
                      Your 1-month free trial is now active. Your payment method has been securely saved and will be charged automatically when the trial ends.
                    </p>
                    
                    <!-- Trial Warning Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400e;">Trial Information</p>
                          <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">
                            Your card will be charged <strong>$20/year</strong> on <strong>Sunday, February 8, 2026</strong>. You can cancel anytime before this date.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
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
                                <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Label (Trial)</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <span style="font-size: 14px; color: #6b7280;">Label Name</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Rafsan Records</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <span style="font-size: 14px; color: #6b7280;">Today</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                <span style="font-size: 14px; font-weight: 700; color: #059669;">$0 (Free)</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <span style="font-size: 14px; color: #6b7280;">After Trial</span>
                              </td>
                              <td style="padding: 12px 0; text-align: right;">
                                <span style="font-size: 14px; font-weight: 600; color: #1f2937;">$20/year</span>
                              </td>
                            </tr>
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

    // Send regular registration email
    const result1 = await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: 'TEST: Welcome to RDistro - Registration Successful',
      html: customerEmailHtml,
    })

    // Send free trial email
    const result2 = await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: 'TEST: Your Free Trial Has Started - RDistro',
      html: trialEmailHtml,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Test emails sent to mdrafsanraz@gmail.com',
      results: { registration: result1, trial: result2 }
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Failed to send test emails' }, { status: 500 })
  }
}

