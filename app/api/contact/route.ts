import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // If Resend API key is configured, send email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: 'RDistro Contact <support@rdistro.net>',
        to: process.env.ADMIN_EMAIL || 'support@rdistro.net',
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 40px; margin: 0; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
              .header { text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
              .logo { font-size: 24px; font-weight: bold; color: #000; }
              .badge { display: inline-block; background: #10b981; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; margin-top: 12px; font-size: 14px; }
              .section { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0; }
              .field { margin-bottom: 12px; }
              .field-label { color: #64748b; font-size: 12px; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
              .field-value { color: #0f172a; font-size: 15px; font-weight: 500; }
              .message-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; white-space: pre-wrap; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">RDistro</div>
                <div class="badge">📩 New Contact Form</div>
              </div>
              
              <div class="section">
                <div class="field">
                  <div class="field-label">From</div>
                  <div class="field-value">${name}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value"><a href="mailto:${email}" style="color: #7c3aed;">${email}</a></div>
                </div>
              </div>
              
              <div class="section">
                <div class="field">
                  <div class="field-label">Message</div>
                  <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
              
              <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 24px;">
                Reply directly to this email to respond to ${name}
              </p>
            </div>
          </body>
          </html>
        `,
        reply_to: email,
      })

      console.log('Contact form email sent from:', email)
    } else {
      // Log to console if no email service configured
      console.log('Contact form submission:', { name, email, message })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
