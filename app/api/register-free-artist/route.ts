import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { addRegistration, emailExists } from '@/lib/registrations'
import { syncInviteForRegistration } from '@/lib/inviteSync'

function generateTxnId() {
  return `FREE-ARTIST-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
}

function hasValidLinks(value?: string) {
  if (!value || !value.trim()) return false
  const links = value
    .split(/[,\n]/)
    .map(link => link.trim())
    .filter(Boolean)

  if (links.length === 0) return false

  return links.every(link => {
    try {
      const normalized = /^(https?:)?\/\//i.test(link) ? link : `https://${link}`
      const parsed = new URL(normalized)
      return !!parsed.hostname && parsed.hostname.includes('.')
    } catch {
      return false
    }
  })
}

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
      socialLinks,
      spotifyLink,
    } = body ?? {}

    if (plan !== 'artist') {
      return NextResponse.json({ error: 'Invalid plan for this endpoint' }, { status: 400 })
    }

    if (!name || !email || !phone || !country || !artistName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!socialLinks?.trim()) {
      return NextResponse.json({ error: 'Social links are required' }, { status: 400 })
    }

    if (!hasValidLinks(socialLinks)) {
      return NextResponse.json({ error: 'Invalid social links URL' }, { status: 400 })
    }

    if (spotifyLink && !hasValidLinks(spotifyLink)) {
      return NextResponse.json({ error: 'Invalid Spotify / music link URL' }, { status: 400 })
    }

    // Duplicate protection
    try {
      const exists = await emailExists(email)
      if (exists) {
        return NextResponse.json(
          { error: 'This email is already registered. Please use a different email or contact support.' },
          { status: 409 }
        )
      }
    } catch (dbError) {
      console.error('Database check error (free artist):', dbError)
      // Continue (do not block signup on transient DB read issues)
    }

    const txnId = generateTxnId()

    // Save registration (this is the primary capture for free Artist signups)
    const registration = await addRegistration({
      plan: 'artist',
      name,
      email,
      phone,
      country,
      artistName,
      labelName: undefined,
      socialLinks: socialLinks || '',
      spotifyLink: spotifyLink || '',
      paymentIntentId: txnId,
      amount: 0,
      freeTrial: false,
      trialEndDate: null,
      paymentStatus: 'succeeded',
    })

    // Auto-sync invite to external admin dashboard (best effort)
    const inviteSync = await syncInviteForRegistration({
      registrationId: registration.id,
      email: registration.email,
      plan: registration.plan,
    })

    // Best-effort emails (do not fail the request if email isn't configured)
    const resendKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.ADMIN_EMAIL

    if (resendKey && adminEmail) {
      try {
        const resend = new Resend(resendKey)

        const adminHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif;">
            <h2>🎉 New FREE Artist Registration</h2>
            <p><strong>Royalties:</strong> 80%</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Country:</strong> ${country}</p>
            <p><strong>Artist:</strong> ${artistName}</p>
            ${socialLinks ? `<p><strong>Social:</strong> ${socialLinks}</p>` : ''}
            ${spotifyLink ? `<p><strong>Spotify/Music Link:</strong> ${spotifyLink}</p>` : ''}
            <p><strong>Transaction ID:</strong> ${txnId}</p>
          </div>
        `

        await resend.emails.send({
          from: 'RDistro <registration@rdistro.net>',
          to: adminEmail,
          subject: `🎤 FREE Artist signup: ${artistName}`,
          html: adminHtml,
        })

        const customerHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif;">
            <h2>Welcome to RDistro 🎵</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your <strong>FREE Artist</strong> plan is confirmed.</p>
            <p><strong>Royalties:</strong> 80%</p>
            <p>We’ll start setting up your account and you’ll receive login details within <strong>24–48 hours</strong>.</p>
            <p style="color:#6b7280;font-size:12px;">Transaction ID: ${txnId}</p>
          </div>
        `

        await resend.emails.send({
          from: 'RDistro <registration@rdistro.net>',
          to: email,
          subject: 'Your RDistro FREE Artist plan is confirmed',
          html: customerHtml,
        })
      } catch (emailError) {
        console.error('Free artist email error:', emailError)
      }
    } else {
      console.log('Email not configured (RESEND_API_KEY/ADMIN_EMAIL missing). Skipping free artist emails.')
    }

    return NextResponse.json({
      success: true,
      txnId,
      inviteSynced: inviteSync.ok,
      inviteMessage: inviteSync.message,
    })
  } catch (error) {
    console.error('Free artist registration error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 })
  }
}

