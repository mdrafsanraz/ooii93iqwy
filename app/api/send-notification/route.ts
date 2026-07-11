import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { addRegistration } from '@/lib/registrations'
import {
  brandEmailLayout,
  emailButton,
  emailCallout,
  emailSignOff,
} from '@/lib/emailLayout'

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set!')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

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
      spotifyLink,
      paymentIntentId,
      amount,
      freeTrial,
      trialEndDate,
    } = body

    console.log('Processing notification for:', email, 'Plan:', plan, 'FreeTrial:', freeTrial)

    // Save registration to MongoDB
    try {
      await addRegistration({
        plan,
        name,
        email,
        phone,
        country,
        artistName,
        labelName,
        socialLinks,
        spotifyLink,
        paymentIntentId,
        amount,
        freeTrial: freeTrial || false,
        trialEndDate: trialEndDate || null,
        paymentStatus: freeTrial ? 'trial' : 'succeeded',
      })
      console.log('Registration saved to MongoDB')
    } catch (dbError) {
      console.error('MongoDB save error:', dbError)
      // Continue to send emails even if DB fails
    }

    const planName = plan === 'artist' ? 'Artist' : 'Label'
    const entityName = plan === 'artist' ? artistName : labelName

    // Customer confirmation email
    const trialDate =
      freeTrial && trialEndDate
        ? new Date(trialEndDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null

    const customerEmailHtml = brandEmailLayout({
      title: freeTrial ? 'Your Free Trial Has Started 🎁' : 'Registration Received ✅',
      subtitle: freeTrial
        ? 'Your RDISTRO Label trial is now active.'
        : 'Thank you for joining RDISTRO.',
      bodyHtml: `
        <p style="font-size:17px;color:#444;line-height:30px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
          ${
            freeTrial
              ? `Your <b>1-month free trial</b> is now active. Your payment method has been securely saved and will be charged automatically when the trial ends.`
              : `Thank you for choosing <b>RDISTRO</b>. We received your registration and payment. Our team is now reviewing your account.`
          }
        </p>
        ${
          trialDate
            ? emailCallout(
                `Your card will be charged your <b>Label plan annual fee</b> on <b>${trialDate}</b>. You can cancel anytime before this date.`,
                '#f59e0b'
              )
            : emailCallout(
                `Your account is being prepared. You’ll receive an update within <b>24–48 hours</b>. Please also check your spam / junk folder.`
              )
        }
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 35px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#6b7280;">Plan</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:15px;font-weight:600;color:#111827;">${planName}${freeTrial ? ' (Trial)' : ''}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#6b7280;">${plan === 'artist' ? 'Artist' : 'Label'}</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:15px;font-weight:600;color:#111827;">${entityName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;font-size:15px;color:#6b7280;">${freeTrial ? 'Today' : 'Amount Paid'}</td>
                  <td style="padding:12px 0;text-align:right;font-size:15px;font-weight:700;color:${freeTrial ? '#059669' : '#111827'};">$${amount}${freeTrial ? ' (Free)' : '/year'}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${emailCallout(
          'Once approved, you can distribute to Spotify, Apple Music, YouTube Music, Amazon Music, and 150+ platforms worldwide.',
          '#00B67A'
        )}
        ${emailButton('https://rdistro.net', 'Visit RDISTRO')}
        <p style="margin-top:40px;font-size:16px;color:#666;line-height:28px;text-align:center;">
          Questions? Contact <a href="mailto:support@rdistro.net" style="color:#6366f1;text-decoration:none;">support@rdistro.net</a>
        </p>
        ${emailSignOff()}
      `,
    })

    // Send customer email
    try {
      console.log('Sending customer email to:', email)
      const customerResult = await resend.emails.send({
        from: 'RDistro <registration@rdistro.net>',
        to: email,
        subject: freeTrial
          ? 'Your Free Trial Has Started — RDISTRO'
          : 'Registration received — RDISTRO',
        html: customerEmailHtml,
      })
      console.log('Customer email result:', customerResult)
    } catch (customerEmailError) {
      console.error('Customer email error:', customerEmailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
