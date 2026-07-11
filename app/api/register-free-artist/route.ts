import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { addRegistration, emailExists } from '@/lib/registrations'
import { getActivePlan } from '@/lib/plans'
import {
  brandEmailLayout,
  emailButton,
  emailCallout,
  emailSignOff,
} from '@/lib/emailLayout'

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

    const activeArtistPlan = await getActivePlan('artist')
    if (!activeArtistPlan || activeArtistPlan.requiresPayment || activeArtistPlan.price > 0) {
      return NextResponse.json(
        { error: 'Artist plan currently requires payment. Please continue to checkout.' },
        { status: 400 }
      )
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

    // Best-effort customer email (do not fail the request if email isn't configured)
    const resendKey = process.env.RESEND_API_KEY

    if (resendKey) {
      try {
        const resend = new Resend(resendKey)

        await resend.emails.send({
          from: 'RDistro <registration@rdistro.net>',
          to: email,
          subject: 'Your registration is in review — RDISTRO',
          html: brandEmailLayout({
            title: 'Registration Received ✅',
            subtitle: 'Your application is now in review.',
            bodyHtml: `
              <p style="font-size:17px;color:#444;line-height:30px;margin:0 0 16px;">Hi ${name},</p>
              <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
                Thank you for choosing <b>RDISTRO</b>. We received your free Artist registration for <b>${artistName}</b> and our team is reviewing it now.
              </p>
              ${emailCallout(
                `You’ll receive an update shortly. Please also check your <b>spam / junk</b> folder for emails from RDISTRO.`
              )}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 35px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Registration Summary</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#6b7280;">Plan</td>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:15px;font-weight:600;color:#111827;">Artist (Free)</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#6b7280;">Artist</td>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:15px;font-weight:600;color:#111827;">${artistName}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;font-size:15px;color:#6b7280;">Reference</td>
                        <td style="padding:12px 0;text-align:right;font-size:13px;font-weight:600;color:#6b7280;">${txnId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ${emailCallout(
                'Once approved, you can distribute to Spotify, Apple Music, and 150+ platforms worldwide.',
                '#00B67A'
              )}
              ${emailButton('https://rdistro.net', 'Visit RDISTRO')}
              <p style="margin-top:40px;font-size:16px;color:#666;line-height:28px;text-align:center;">
                Questions? Contact <a href="mailto:support@rdistro.net" style="color:#6366f1;text-decoration:none;">support@rdistro.net</a>
              </p>
              ${emailSignOff()}
            `,
          }),
        })
      } catch (emailError) {
        console.error('Free artist email error:', emailError)
      }
    } else {
      console.log('Email not configured (RESEND_API_KEY missing). Skipping free artist emails.')
    }

    return NextResponse.json({
      success: true,
      txnId,
    })
  } catch (error) {
    console.error('Free artist registration error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 })
  }
}

