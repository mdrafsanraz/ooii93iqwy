/** Shared RDISTRO branded HTML email shell (Trustpilot-style layout). */

export function brandEmailLayout(options: {
  title: string
  subtitle: string
  bodyHtml: string
}): string {
  const year = new Date().getFullYear()
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f4f6f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">
          <tr>
            <td align="center" style="background:#111827;padding:50px 40px;">
              <img src="https://rdistro.net/logo.png" width="170" alt="RDISTRO" style="display:block;margin:0 auto;" />
              <h1 style="margin:25px 0 10px;color:#ffffff;font-size:34px;line-height:1.2;">${options.title}</h1>
              <p style="margin:0;color:#d1d5db;font-size:18px;line-height:30px;">${options.subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:50px 45px;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#111827;padding:30px;">
              <p style="color:#9ca3af;font-size:14px;margin:0;">© ${year} RDISTRO. All rights reserved.</p>
              <p style="color:#6b7280;font-size:13px;margin-top:10px;">Supporting independent artists worldwide.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

export function emailCallout(text: string, accent = '#6366f1'): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:35px 0;background:#f8fafc;border-left:4px solid ${accent};border-radius:8px;">
  <tr>
    <td style="padding:25px;">
      <p style="margin:0;font-size:16px;color:#555;line-height:28px;">${text}</p>
    </td>
  </tr>
</table>
`.trim()
}

export function emailButton(href: string, label: string, bg = '#111827'): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <a href="${href}" style="background:${bg};color:#ffffff;text-decoration:none;padding:18px 40px;border-radius:8px;font-size:18px;font-weight:bold;display:inline-block;">${label}</a>
    </td>
  </tr>
</table>
`.trim()
}

export function emailSignOff(): string {
  return `
<p style="margin-top:35px;font-size:17px;color:#111827;">Thank you for choosing RDISTRO.</p>
<p style="font-size:17px;color:#666;margin:0;">
  With appreciation,<br />
  <b>The RDISTRO Team</b>
</p>
`.trim()
}
