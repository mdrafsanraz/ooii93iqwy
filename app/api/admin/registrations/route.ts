import { NextRequest, NextResponse } from 'next/server'
import { getRegistrations, getStats, updateRegistration, deleteRegistration, getRegistrationById } from '@/lib/registrations'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { syncInviteForRegistration } from '@/lib/inviteSync'
import {
  brandEmailLayout,
  emailButton,
  emailCallout,
  emailSignOff,
} from '@/lib/emailLayout'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function sendRegistrationAcceptedEmail(to: string, name: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set; skipping registration accepted email')
    return false
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const firstName = escapeHtml(name.trim().split(/\s+/)[0] || 'there')
  const { data, error } = await resend.emails.send({
    from: 'RDistro <registration@rdistro.net>',
    to: [to],
    subject: 'Your registration is accepted — RDISTRO',
    html: brandEmailLayout({
      title: 'Registration Accepted ✅',
      subtitle: 'Your RDISTRO account is being prepared.',
      bodyHtml: `
        <p style="font-size:17px;color:#444;line-height:30px;margin:0 0 16px;">Hi ${firstName},</p>
        <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
          Great news — <b>your registration has been accepted</b>. Thank you for choosing <b>RDISTRO</b> for your music distribution.
        </p>
        ${emailCallout(
          `You will receive a separate invite email to access the platform shortly. Please also check your <b>spam / junk</b> folder if you don’t see it right away.`
        )}
        ${emailCallout(
          `If you're seeing the <b>“Something went wrong”</b> error when creating your account using the invitation link, please contact us on WhatsApp at <a href="https://wa.me/447492069504" style="color:#111827;font-weight:700;text-decoration:none;">+44 7492 069504</a>. We'll assist you directly and help resolve the issue as quickly as possible.`,
          '#f59e0b'
        )}
        ${emailCallout(
          'Once you receive your invite, you can start distributing to Spotify, Apple Music, and 150+ platforms worldwide.',
          '#00B67A'
        )}
        ${emailButton('https://portal.rdistro.net', 'Open RDISTRO Portal')}
        <p style="margin-top:40px;font-size:16px;color:#666;line-height:28px;text-align:center;">
          Need help? WhatsApp us at <a href="https://wa.me/447492069504" style="color:#25D366;text-decoration:none;font-weight:600;">+44 7492 069504</a>
          or email <a href="mailto:support@rdistro.net" style="color:#6366f1;text-decoration:none;">support@rdistro.net</a>
        </p>
        <p style="margin-top:35px;font-size:17px;color:#111827;">Welcome to the RDISTRO community.</p>
        <p style="font-size:17px;color:#666;margin:0;">
          With appreciation,<br />
          <b>The RDISTRO Team</b>
        </p>
      `,
    }),
  })

  if (error) {
    console.error('Failed to send registration accepted email to:', to, error)
    throw new Error(error.message || 'Failed to send accepted email')
  }

  console.log('Registration accepted email sent to:', to, data?.id)
  return true
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
    subject: 'Registration update — RDISTRO',
    html: brandEmailLayout({
      title: 'Registration Update',
      subtitle: 'We’ve reviewed your RDISTRO application.',
      bodyHtml: `
        <p style="font-size:17px;color:#444;line-height:30px;margin:0 0 16px;">Hi ${firstName},</p>
        <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
          Thank you for your interest in <b>RDISTRO</b>. After reviewing your registration, we are unable to approve it at this time.
        </p>
        ${emailCallout(
          'Please review and correct your details, then submit a new registration when you’re ready. Our team is happy to take another look.',
          '#f59e0b'
        )}
        ${emailButton('https://rdistro.net/signup', 'Submit Again')}
        <p style="margin-top:40px;font-size:16px;color:#666;line-height:28px;text-align:center;">
          Questions? Reach us at <a href="mailto:support@rdistro.net" style="color:#6366f1;text-decoration:none;">support@rdistro.net</a>
        </p>
        ${emailSignOff()}
      `,
    }),
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
      try {
        await sendRegistrationAcceptedEmail(before.email, before.name)
      } catch (emailError) {
        console.error('Accepted email failed after mark created:', emailError)
        return NextResponse.json(
          {
            success: true,
            registration: updated,
            emailSent: false,
            warning: 'Marked as created, but accept email failed to send',
          },
          { status: 200 }
        )
      }
    }

    return NextResponse.json({ success: true, registration: updated, emailSent: true })
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
    
    const { id, action, ids } = await request.json()

    if (action === 'bulk_mark_created') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
      }

      const results: {
        id: string
        email: string
        marked: boolean
        emailed: boolean
        error?: string
      }[] = []

      for (const regId of ids) {
        try {
          const before = await getRegistrationById(regId)
          if (!before) {
            results.push({ id: regId, email: '', marked: false, emailed: false, error: 'Not found' })
            continue
          }

          if (before.accountCreated) {
            results.push({
              id: regId,
              email: before.email,
              marked: true,
              emailed: false,
              error: 'Already created',
            })
            continue
          }

          const updated = await updateRegistration(regId, { accountCreated: true })
          if (!updated) {
            results.push({
              id: regId,
              email: before.email,
              marked: false,
              emailed: false,
              error: 'Update failed',
            })
            continue
          }

          let emailed = false
          try {
            emailed = await sendRegistrationAcceptedEmail(before.email, before.name)
          } catch (emailError) {
            console.error('Bulk accept email failed for:', before.email, emailError)
            results.push({
              id: regId,
              email: before.email,
              marked: true,
              emailed: false,
              error: emailError instanceof Error ? emailError.message : 'Email failed',
            })
            // Small pause before next to reduce rate-limit pressure
            await new Promise((r) => setTimeout(r, 400))
            continue
          }

          results.push({ id: regId, email: before.email, marked: true, emailed })
          // Space out Resend calls so bulk sends don't get rate-limited
          await new Promise((r) => setTimeout(r, 400))
        } catch (err) {
          results.push({
            id: regId,
            email: '',
            marked: false,
            emailed: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }

      const marked = results.filter((r) => r.marked).length
      const emailed = results.filter((r) => r.emailed).length
      const failedEmail = results.filter((r) => r.marked && !r.emailed && r.error !== 'Already created').length

      return NextResponse.json({
        success: true,
        marked,
        emailed,
        failedEmail,
        results,
        message: `Marked ${marked} as created. Emails sent: ${emailed}${failedEmail ? `, failed: ${failedEmail}` : ''}.`,
      })
    }
    
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
