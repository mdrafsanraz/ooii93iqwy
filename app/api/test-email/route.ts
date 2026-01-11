import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const testEmail = 'mdrafsanraz@gmail.com'
    
    // Sample data for templates
    const name = 'Rafsan'
    const planName = 'Label'
    const entityName = 'Rafsan Records'
    const amount = 20
    const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const results = []

    // ============================================
    // 1. REGISTRATION SUCCESSFUL (Paid)
    // ============================================
    const registrationEmail = `
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
                <tr>
                  <td style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
                    <img src="https://app.rdistro.net/logo.jpg" alt="RDistro" width="120" height="120" style="display: block; margin: 0 auto 16px; border-radius: 8px;" />
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">RDistro</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #9ca3af;">Music Distribution</p>
                  </td>
                </tr>
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
                <tr>
                  <td style="padding: 32px 40px;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">Welcome to RDistro</h2>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; text-align: center;">Your music distribution journey begins now</p>
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.7;">Hi <strong style="color: #1f2937;">${name}</strong>,</p>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.7;">Thank you for choosing RDistro. We have received your registration and payment. Our team is now setting up your account.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1e40af;">What Happens Next</p>
                          <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">Your account is being prepared. You will receive your login credentials and access details via email within <strong>24-48 hours</strong>.</p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Order Summary</p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="font-size: 14px; color: #6b7280;">Plan</span></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="font-size: 14px; font-weight: 600; color: #1f2937;">Artist</span></td></tr>
                            <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="font-size: 14px; color: #6b7280;">Artist Name</span></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="font-size: 14px; font-weight: 600; color: #1f2937;">Rafsan Music</span></td></tr>
                            <tr><td style="padding: 12px 0;"><span style="font-size: 14px; color: #6b7280;">Amount Paid</span></td><td style="padding: 12px 0; text-align: right;"><span style="font-size: 14px; font-weight: 700; color: #1f2937;">$5/year</span></td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #166534;">Ready to Distribute</p>
                          <p style="margin: 0 0 16px; font-size: 14px; color: #15803d; line-height: 1.6;">Once your account is ready, you can distribute your music to all major streaming platforms worldwide.</p>
                          <p style="margin: 0; font-size: 13px; color: #166534;">Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, Tidal, and 450+ more platforms</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.6;">We are excited to have you on board. If you have any questions, feel free to reach out to our support team.</p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">The RDistro Team</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #1f2937;">RDistro</p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Music Distribution Made Simple<br><a href="https://rdistro.net" style="color: #7c3aed; text-decoration: none;">rdistro.net</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    results.push(await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: '[1/6] Registration Successful - Welcome to RDistro',
      html: registrationEmail,
    }))

    // ============================================
    // 2. FREE TRIAL STARTED
    // ============================================
    const trialEmail = `
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
                <tr>
                  <td style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
                    <img src="https://app.rdistro.net/logo.jpg" alt="RDistro" width="120" height="120" style="display: block; margin: 0 auto 16px; border-radius: 8px;" />
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">RDistro</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #9ca3af;">Music Distribution</p>
                  </td>
                </tr>
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
                <tr>
                  <td style="padding: 32px 40px;">
                    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">Your Free Trial Has Started</h2>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; text-align: center;">Your music distribution journey begins now</p>
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.7;">Hi <strong style="color: #1f2937;">${name}</strong>,</p>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.7;">Your 1-month free trial is now active. Your payment method has been securely saved and will be charged automatically when the trial ends.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400e;">Trial Information</p>
                          <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">Your card will be charged <strong>$20/year</strong> on <strong>${trialEndDate}</strong>. You can cancel anytime before this date.</p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1e40af;">What Happens Next</p>
                          <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">Your account is being prepared. You will receive your login credentials and access details via email within <strong>24-48 hours</strong>.</p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Order Summary</p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="font-size: 14px; color: #6b7280;">Plan</span></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="font-size: 14px; font-weight: 600; color: #1f2937;">${planName} (Trial)</span></td></tr>
                            <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="font-size: 14px; color: #6b7280;">Label Name</span></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="font-size: 14px; font-weight: 600; color: #1f2937;">${entityName}</span></td></tr>
                            <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="font-size: 14px; color: #6b7280;">Today</span></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="font-size: 14px; font-weight: 700; color: #059669;">$0 (Free)</span></td></tr>
                            <tr><td style="padding: 12px 0;"><span style="font-size: 14px; color: #6b7280;">After Trial</span></td><td style="padding: 12px 0; text-align: right;"><span style="font-size: 14px; font-weight: 600; color: #1f2937;">$${amount}/year</span></td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #166534;">Ready to Distribute</p>
                          <p style="margin: 0 0 16px; font-size: 14px; color: #15803d; line-height: 1.6;">Once your account is ready, you can distribute your music to all major streaming platforms worldwide.</p>
                          <p style="margin: 0; font-size: 13px; color: #166534;">Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, Tidal, and 450+ more platforms</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.6;">We are excited to have you on board. If you have any questions, feel free to reach out to our support team.</p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">The RDistro Team</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #1f2937;">RDistro</p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Music Distribution Made Simple<br><a href="https://rdistro.net" style="color: #7c3aed; text-decoration: none;">rdistro.net</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    results.push(await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: '[2/6] Your Free Trial Has Started - RDistro',
      html: trialEmail,
    }))

    // ============================================
    // 3. TRIAL ENDING SOON (3 days before)
    // ============================================
    const trialEndingEmail = `
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
          <div class="date">Trial ends: ${trialEndDate}</div>
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
    `

    results.push(await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: '[3/6] Your Free Trial Ends Soon - RDistro',
      html: trialEndingEmail,
    }))

    // ============================================
    // 4. PAYMENT SUCCESSFUL (Renewal)
    // ============================================
    const paymentSuccessEmail = `
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
          <div class="amount">$20.00</div>
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
    `

    results.push(await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: '[4/6] Payment Successful - RDistro Subscription',
      html: paymentSuccessEmail,
    }))

    // ============================================
    // 5. PAYMENT FAILED
    // ============================================
    const paymentFailedEmail = `
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
    `

    results.push(await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: '[5/6] Payment Failed - Action Required',
      html: paymentFailedEmail,
    }))

    // ============================================
    // 6. SUBSCRIPTION CANCELLED
    // ============================================
    const cancelledEmail = `
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
                <tr>
                  <td style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
                    <img src="https://app.rdistro.net/logo.jpg" alt="RDistro" width="80" height="80" style="display: block; margin: 0 auto 16px; border-radius: 8px;" />
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">RDistro</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 40px;">
                    <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #1f2937; text-align: center;">Subscription Cancelled</h2>
                    <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.7;">Hi ${name},</p>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.7;">Your RDistro subscription has been cancelled. We're sorry to see you go.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400e;">What This Means</p>
                          <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">Your releases will remain on streaming platforms until the end of your current billing period. After that, they may be taken down.</p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1e40af;">Want to Come Back?</p>
                          <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">You can reactivate your subscription at any time by visiting <a href="https://app.rdistro.net" style="color: #7c3aed; text-decoration: none; font-weight: 600;">app.rdistro.net</a> or contacting our support team.</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7;">Thank you for being part of RDistro. We hope to see you again!</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">The RDistro Team</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Questions? Contact us at <a href="mailto:support@rdistro.net" style="color: #7c3aed; text-decoration: none;">support@rdistro.net</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    results.push(await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: testEmail,
      subject: '[6/6] Your RDistro Subscription Has Been Cancelled',
      html: cancelledEmail,
    }))

    return NextResponse.json({ 
      success: true, 
      message: `All 6 email templates sent to ${testEmail}`,
      emails: [
        '1. Registration Successful',
        '2. Free Trial Started',
        '3. Trial Ending Soon',
        '4. Payment Successful',
        '5. Payment Failed',
        '6. Subscription Cancelled',
      ],
      results
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Failed to send test emails', details: String(error) }, { status: 500 })
  }
}
