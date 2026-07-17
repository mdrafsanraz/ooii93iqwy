import { brandEmailLayout, emailButton, emailCallout, emailSignOff } from './emailLayout'

export const ARTIST_PRICE_UPDATE_SUBJECT =
  'Important update: Artist plan becomes $10/year from July 20 — RDISTRO'

export function buildArtistPriceUpdateEmail(name?: string): string {
  const firstName = (name || 'there').trim().split(/\s+/)[0] || 'there'

  return brandEmailLayout({
    title: 'Artist Plan Price Update',
    subtitle: 'Effective July 20, 2026',
    bodyHtml: `
      <p style="font-size:17px;color:#444;line-height:30px;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
        We’re writing to share an important update about our <b>Artist plan</b> pricing.
      </p>
      <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
        Starting <b>July 20, 2026</b>, the RDISTRO Artist plan will be
        <b>$10 per year</b>.
      </p>
      ${emailCallout(
        `<b>What this means:</b><br/>
        • New Artist signups from July 20 will be billed at <b>$10/year</b>.<br/>
        • Existing members will continue under their current plan terms unless otherwise notified.<br/>
        • You’ll still get distribution to Spotify, Apple Music, and 150+ platforms, plus analytics and artist tools.`,
        '#6366f1'
      )}
      ${emailCallout(
        `If you have any questions about this change, reply to this email or contact
        <a href="mailto:support@rdistro.net" style="color:#111827;font-weight:700;text-decoration:none;">support@rdistro.net</a>.`,
        '#f59e0b'
      )}
      ${emailButton('https://rdistro.net/#pricing', 'View Pricing')}
      <p style="margin-top:40px;font-size:16px;color:#666;line-height:28px;text-align:center;">
        Thank you for being part of the RDISTRO community.
      </p>
      ${emailSignOff()}
    `,
  })
}

export const ARTIST_PRICE_UPDATE_PLAIN = `Hi [NAME],

We're writing to share an important update about our Artist plan pricing.

Starting July 20, 2026, the RDISTRO Artist plan will be $10 per year.

What this means:
• New Artist signups from July 20 will be billed at $10/year.
• Existing members will continue under their current plan terms unless otherwise notified.
• You'll still get distribution to Spotify, Apple Music, and 150+ platforms, plus analytics and artist tools.

Questions? Reply to this email or contact support@rdistro.net.

View pricing: https://rdistro.net/#pricing

With appreciation,
The RDISTRO Team`

export const EXISTING_USER_PRICE_REASSURE_SUBJECT =
  'Worried about the new price? It doesn’t affect existing members — RDISTRO'

export function buildExistingUserPriceReassureEmail(name?: string): string {
  const firstName = (name || 'there').trim().split(/\s+/)[0] || 'there'

  return brandEmailLayout({
    title: 'You’re Not Affected',
    subtitle: 'A quick note for existing members',
    bodyHtml: `
      <p style="font-size:17px;color:#444;line-height:30px;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
        You may have seen that our <b>Artist plan</b> will be <b>$10 per year</b> for new signups
        starting <b>July 20, 2026</b>.
      </p>
      <p style="font-size:17px;color:#555;line-height:30px;margin:0 0 16px;">
        If you’re worried this changes something for you — <b>it doesn’t</b>.
      </p>
      ${emailCallout(
        `<b>Good news for existing members:</b><br/>
        • The new price applies to <b>new Artist signups only</b>.<br/>
        • Your current plan and pricing stay the same.<br/>
        • No action is needed on your side.`,
        '#10b981'
      )}
      ${emailCallout(
        `Questions? Reply to this email or contact
        <a href="mailto:support@rdistro.net" style="color:#111827;font-weight:700;text-decoration:none;">support@rdistro.net</a>
        — we’re happy to help.`,
        '#6366f1'
      )}
      ${emailButton('https://app.rdistro.net', 'Go to Your Account')}
      <p style="margin-top:40px;font-size:16px;color:#666;line-height:28px;text-align:center;">
        Thanks for being with RDISTRO.
      </p>
      ${emailSignOff()}
    `,
  })
}

export const EXISTING_USER_PRICE_REASSURE_PLAIN = `Hi [NAME],

You may have seen that our Artist plan will be $10 per year for new signups starting July 20, 2026.

If you're worried this changes something for you — it doesn't.

Good news for existing members:
• The new price applies to new Artist signups only.
• Your current plan and pricing stay the same.
• No action is needed on your side.

Questions? Reply to this email or contact support@rdistro.net.

Go to your account: https://app.rdistro.net

With appreciation,
The RDISTRO Team`
