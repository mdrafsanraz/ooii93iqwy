import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getRegistrations } from '@/lib/registrations'
import {
  ARTIST_PRICE_UPDATE_SUBJECT,
  EXISTING_USER_PRICE_REASSURE_SUBJECT,
  buildArtistPriceUpdateEmail,
  buildExistingUserPriceReassureEmail,
} from '@/lib/emailTemplates'

export const maxDuration = 300

const VALID_SENDERS = [
  'fatama@rdistro.net',
  'rafsan@rdistro.net',
  'support@rdistro.net',
  'registration@rdistro.net',
]

const SENDER_NAMES: Record<string, string> = {
  'fatama@rdistro.net': 'Fatama - RDistro',
  'rafsan@rdistro.net': 'Rafsan - RDistro',
  'support@rdistro.net': 'RDistro Support',
  'registration@rdistro.net': 'RDistro Registration',
}

const BRANDED_TEMPLATES: Record<
  string,
  { defaultSubject: string; buildHtml: (name?: string) => string }
> = {
  artist_price_update: {
    defaultSubject: ARTIST_PRICE_UPDATE_SUBJECT,
    buildHtml: buildArtistPriceUpdateEmail,
  },
  existing_user_price_reassure: {
    defaultSubject: EXISTING_USER_PRICE_REASSURE_SUBJECT,
    buildHtml: buildExistingUserPriceReassureEmail,
  },
}

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Basic ')) return false
  try {
    const credentials = atob(authHeader.slice(6))
    const [, password] = credentials.split(':')
    return password === process.env.ADMIN_PASSWORD
  } catch {
    return false
  }
}

function plainMessageToHtml(message: string): string {
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
${escaped}
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
  `
}

async function sendOne(
  resend: Resend,
  from: string,
  to: string,
  subject: string,
  html: string
) {
  const { data, error } = await resend.emails.send({
    from: `${SENDER_NAMES[from] || 'RDistro'} <${from}>`,
    to: [to],
    subject,
    html,
    reply_to: from,
  })
  if (error) throw new Error(error.message || 'Failed to send email')
  return data?.id
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await request.json()
    const {
      from,
      to,
      subject,
      message,
      template,
      sendToAll,
    }: {
      from?: string
      to?: string
      subject?: string
      message?: string
      template?: string
      sendToAll?: boolean
    } = body

    if (!from || !VALID_SENDERS.includes(from)) {
      return NextResponse.json({ error: 'Invalid sender email' }, { status: 400 })
    }

    const branded = template ? BRANDED_TEMPLATES[template] : undefined
    if (branded) {
      const emailSubject = subject || branded.defaultSubject

      if (sendToAll) {
        const registrations = await getRegistrations()
        const recipients = Array.from(
          new Map(
            registrations
              .filter((r) => r.email)
              .map((r) => [r.email.toLowerCase(), { email: r.email, name: r.name }])
          ).values()
        )

        if (recipients.length === 0) {
          return NextResponse.json({ error: 'No registered users found' }, { status: 400 })
        }

        const results: { email: string; ok: boolean; error?: string }[] = []
        for (const recipient of recipients) {
          try {
            await sendOne(
              resend,
              from,
              recipient.email,
              emailSubject,
              branded.buildHtml(recipient.name)
            )
            results.push({ email: recipient.email, ok: true })
          } catch (err) {
            results.push({
              email: recipient.email,
              ok: false,
              error: err instanceof Error ? err.message : 'Failed',
            })
          }
          await new Promise((r) => setTimeout(r, 400))
        }

        const sent = results.filter((r) => r.ok).length
        const failed = results.filter((r) => !r.ok).length
        return NextResponse.json({
          success: true,
          sent,
          failed,
          total: recipients.length,
          results,
          message: `Sent to ${sent}/${recipients.length} users${failed ? ` (${failed} failed)` : ''}.`,
        })
      }

      if (!to) {
        return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(to)) {
        return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 })
      }

      const registrations = await getRegistrations()
      const match = registrations.find((r) => r.email.toLowerCase() === to.toLowerCase())
      const messageId = await sendOne(
        resend,
        from,
        to,
        emailSubject,
        branded.buildHtml(match?.name)
      )

      return NextResponse.json({ success: true, messageId, sent: 1 })
    }

    // Generic plain compose
    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 })
    }

    const messageId = await sendOne(resend, from, to, subject, plainMessageToHtml(message))
    return NextResponse.json({ success: true, messageId })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
