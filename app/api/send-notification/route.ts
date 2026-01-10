import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { addRegistration } from '@/lib/registrations'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
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
      paymentIntentId,
      amount,
    } = body

    // Save registration to MongoDB
    await addRegistration({
      plan,
      name,
      email,
      phone,
      country,
      artistName,
      labelName,
      socialLinks,
      paymentIntentId,
      amount,
      paymentStatus: 'succeeded',
    })

    const planName = plan === 'artist' ? 'Artist' : 'Label'
    const entityName = plan === 'artist' ? artistName : labelName

    // Email to admin (registration@rdistro.net)
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
          .header { text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
          .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .badge { display: inline-block; background: #7c3aed; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; margin-top: 12px; font-size: 14px; }
          .section { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0; }
          .section-title { color: #7c3aed; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-weight: 600; }
          .field { margin-bottom: 12px; }
          .field-label { color: #64748b; font-size: 12px; margin-bottom: 2px; }
          .field-value { color: #0f172a; font-size: 15px; font-weight: 500; }
          .amount { font-size: 28px; font-weight: bold; color: #7c3aed; }
          .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">RDistro</div>
            <div class="badge">🎉 New ${planName} Registration</div>
          </div>
          
          <div class="section">
            <div class="section-title">💳 Payment</div>
            <div class="field">
              <div class="field-label">Plan</div>
              <div class="field-value">${planName} Plan</div>
            </div>
            <div class="field">
              <div class="field-label">Amount</div>
              <div class="amount">$${amount}</div>
            </div>
            <div class="field">
              <div class="field-label">Payment ID</div>
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
              <div class="field-label">Social Links</div>
              <div class="field-value" style="font-size: 13px;">${socialLinks}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p><strong>Action Required:</strong> Create account for this customer</p>
            <p style="margin-top: 8px;">View all registrations at <a href="https://app.rdistro.com/admin" style="color: #7c3aed;">app.rdistro.com/admin</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email to admin
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: process.env.ADMIN_EMAIL!,
      subject: `🎵 New ${planName} Registration: ${entityName} ($${amount})`,
      html: adminEmailHtml,
    })

    // Send confirmation email to customer
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
          .summary { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
          .summary-row:last-child { border-bottom: none; }
          .summary-label { color: #64748b; }
          .summary-value { color: #0f172a; font-weight: 500; }
          .footer { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
          .footer a { color: #7c3aed; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">RDistro</div>
          
          <div class="icon">
            <div class="icon-circle">✓</div>
          </div>
          
          <h1 class="title">We Received Your Details!</h1>
          <p class="subtitle">Thank you for registering with RDistro</p>
          
          <p class="message">Hi ${name},</p>
          
          <p class="message">
            We have successfully received your registration and payment. Your account is now being prepared by our team.
          </p>
          
          <div class="highlight">
            <div class="highlight-title">📧 What's Next?</div>
            <div class="highlight-text">
              Your account is being set up. You will receive your account details and login credentials via email within <strong>24-48 hours</strong>.
            </div>
          </div>
          
          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Plan</span>
              <span class="summary-value">${planName}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${plan === 'artist' ? 'Artist Name' : 'Label Name'}</span>
              <span class="summary-value">${entityName}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Amount Paid</span>
              <span class="summary-value">$${amount}/year</span>
            </div>
          </div>
          
          <p class="message">
            Once your account is ready, you can start distributing your music to Spotify, Apple Music, and 150+ streaming platforms worldwide.
          </p>
          
          <p class="message">
            If you have any questions, simply reply to this email and we'll be happy to help.
          </p>
          
          <p class="message" style="margin-top: 24px;">
            Welcome to RDistro! 🎵<br>
            <strong>The RDistro Team</strong>
          </p>
          
          <div class="footer">
            <p>© RDistro - Music Distribution</p>
            <p><a href="https://rdistro.net">rdistro.net</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: email,
      subject: '✓ We Received Your Registration - RDistro',
      html: customerEmailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
