import { NextRequest, NextResponse } from 'next/server'
import { getRegistrations, getStats, updateRegistration, deleteRegistration, getRegistrationById } from '@/lib/registrations'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { syncInviteForRegistration } from '@/lib/inviteSync'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function sendRegistrationAcceptedEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set; skipping registration accepted email')
    return
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const firstName = escapeHtml(name.trim().split(/\s+/)[0] || 'there')
    await resend.emails.send({
      from: 'RDistro <registration@rdistro.net>',
      to: [to],
      subject: 'Your registration is accepted — RDistro',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f8fafc;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
            <tr><td align="center">
              <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
                <tr><td style="padding:32px 28px;">
                  <p style="margin:0 0 16px;font-size:16px;color:#0f172a;line-height:1.6;">Hi ${firstName},</p>
                  <p style="margin:0 0 16px;font-size:16px;color:#0f172a;line-height:1.6;">
                    <strong>Your registration is accepted.</strong> You will receive an invite to access the platform—please check your email inbox and your <strong>spam / junk</strong> folder if you don’t see it right away.
                  </p>
                  <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                    If you need help, reply to this email or contact <a href="mailto:support@rdistro.net" style="color:#6366f1;">support@rdistro.net</a>.
                  </p>
                </td></tr>
                <tr><td style="padding:16px 28px 28px;border-top:1px solid #f1f5f9;">
                  <p style="margin:0;font-size:13px;color:#94a3b8;">— The RDistro Team</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    })
    console.log('Registration accepted email sent to:', to)
  } catch (err) {
    console.error('Failed to send registration accepted email:', err)
  }
}

async function sendRegistrationRejectedEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not set')
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const firstName = escapeHtml(name.trim().split(/\s+/)[0] || 'there')
  await resend.emails.send({
    from: 'RDistro <registration@rdistro.net>',
    to: [to],
    subject: 'Registration update — RDistro',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f8fafc;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
              <tr><td style="padding:32px 28px;">
                <p style="margin:0 0 16px;font-size:16px;color:#0f172a;line-height:1.6;">Hi ${firstName},</p>
                <p style="margin:0 0 16px;font-size:16px;color:#0f172a;line-height:1.6;">
                  We reviewed your registration and cannot approve it at this time.
                </p>
                <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                  Please review and correct your details, then submit again.
                </p>
              </td></tr>
              <tr><td style="padding:16px 28px 28px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:13px;color:#94a3b8;">— The RDistro Team</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword || !authHeader) return false
  
  const [type, credentials] = authHeader.split(' ')
  if (type !== 'Basic') return false
  
  try {
    const decoded = Buffer.from(credentials, 'base64').toString()
    const [, password] = decoded.split(':')
    return password === adminPassword
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const registrations = await getRegistrations()
    const stats = await getStats()
    
    return NextResponse.json({ registrations, stats })
  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, accountCreated } = await request.json()

    const before = await getRegistrationById(id)
    if (!before) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    const updated = await updateRegistration(id, { accountCreated })

    if (!updated) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Email user once when admin marks registration as created (accepted)
    if (accountCreated === true && !before.accountCreated) {
      await sendRegistrationAcceptedEmail(before.email, before.name)
    }

    return NextResponse.json({ success: true, registration: updated })
  } catch (error) {
    console.error('Admin PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, cancelSubscription } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 })
    }
    
    const registration = await getRegistrationById(id)
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }
    
    if (cancelSubscription && registration.subscriptionId) {
      try {
        await stripe.subscriptions.cancel(registration.subscriptionId)
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError)
      }
    }
    
    const deleted = await deleteRegistration(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, action } = await request.json()
    
    if (action === 'cancel_subscription') {
      const registration = await getRegistrationById(id)
      
      if (!registration) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
      }
      
      if (!registration.subscriptionId) {
        return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
      }
      
      try {
        await stripe.subscriptions.cancel(registration.subscriptionId)
        await updateRegistration(id, { subscriptionStatus: 'cancelled', paymentStatus: 'failed' })
        return NextResponse.json({ success: true })
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError)
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
      }
    }

    if (action === 'retry_invite') {
      const registration = await getRegistrationById(id)

      if (!registration) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
      }

      const inviteSync = await syncInviteForRegistration({
        registrationId: registration.id,
        email: registration.email,
        plan: registration.plan,
        force: true,
      })

      if (!inviteSync.ok) {
        return NextResponse.json({ error: inviteSync.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: inviteSync.message })
    }

    if (action === 'reject_registration') {
      const registration = await getRegistrationById(id)
      if (!registration) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
      }

      try {
        await sendRegistrationRejectedEmail(registration.email, registration.name)
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
        return NextResponse.json({ error: 'Failed to send rejection email' }, { status: 500 })
      }

      const deleted = await deleteRegistration(id)
      if (!deleted) {
        return NextResponse.json({ error: 'Failed to delete registration after rejection' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Registration rejected, email sent, and record deleted.' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
