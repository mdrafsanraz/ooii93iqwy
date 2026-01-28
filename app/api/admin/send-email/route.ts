import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const VALID_SENDERS = [
  'fatama@rdistro.net',
  'rafsan@rdistro.net',
  'support@rdistro.net',
  'registration@rdistro.net',
]

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const credentials = atob(authHeader.slice(6))
  const [, password] = credentials.split(':')
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { from, to, subject, message } = await request.json()

    if (!from || !to || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!VALID_SENDERS.includes(from)) {
      return NextResponse.json({ error: 'Invalid sender email' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 })
    }

    const senderNames: Record<string, string> = {
      'fatama@rdistro.net': 'Fatama - RDistro',
      'rafsan@rdistro.net': 'Rafsan - RDistro',
      'support@rdistro.net': 'RDistro Support',
      'registration@rdistro.net': 'RDistro Registration',
    }

    const { data, error } = await resend.emails.send({
      from: `${senderNames[from] || 'RDistro'} <${from}>`,
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
${message}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <div style="font-size: 12px; color: #666;">
            <p style="margin: 0;">Best regards,</p>
            <p style="margin: 5px 0 0 0; font-weight: 600;">RDistro Team</p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://rdistro.net" style="color: #000; text-decoration: none;">rdistro.net</a>
            </p>
          </div>
        </div>
      `,
      reply_to: from,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
    }

    console.log('Email sent:', { id: data?.id, from, to, subject })

    return NextResponse.json({ success: true, messageId: data?.id })

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
