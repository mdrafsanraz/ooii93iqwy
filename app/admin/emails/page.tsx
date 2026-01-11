'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'

const EMAIL_ACCOUNTS = [
  { email: 'fatama@rdistro.net', label: 'Fatama', icon: '👤', description: 'Personal' },
  { email: 'rafsan@rdistro.net', label: 'Rafsan', icon: '👤', description: 'Personal' },
  { email: 'support@rdistro.net', label: 'Support', icon: '🎧', description: 'Customer Support' },
  { email: 'registration@rdistro.net', label: 'Registration', icon: '📝', description: 'New Signups' },
]

const EMAIL_TEMPLATES = [
  {
    id: 'request-links',
    name: 'Request Links for Onboarding',
    icon: '🔗',
    subject: 'Action Required: Complete Your RDistro Onboarding',
    message: `Hi [NAME],

Thank you for starting your free trial with RDistro! We're excited to have you on board.

To complete your account setup and start distributing your music, we need a few more details from you:

📱 SOCIAL MEDIA LINKS (Required)
Please provide your Facebook or Instagram profile link:
• Facebook: ____________________
• Instagram: ____________________

🎵 MUSIC LINKS (Required)
Please provide your Spotify artist profile or other music platform link:
• Spotify: ____________________
• Apple Music: ____________________
• YouTube: ____________________
• Other: ____________________

WHY WE NEED THIS:
These links help us verify your identity as an artist/label and are required by streaming platforms for proper artist profile linking and verification.

Please reply to this email with the above information, and we'll have your account ready within 24-48 hours.

If you have any questions, feel free to reach out!

Best regards,
The RDistro Team`
  },
  {
    id: 'account-ready',
    name: 'Account Ready',
    icon: '✅',
    subject: 'Your RDistro Account is Ready!',
    message: `Hi [NAME],

Great news! Your RDistro account has been set up and is ready to use.

🔐 YOUR LOGIN DETAILS:
• Login URL: https://app.rdistro.net
• Email: [EMAIL]
• Password: [PASSWORD]

📋 NEXT STEPS:
1. Log in to your dashboard
2. Upload your first release
3. Select your distribution platforms
4. Submit for review

Your music will be live on Spotify, Apple Music, YouTube Music, Amazon Music, and 450+ other platforms within 2-7 days after submission.

Need help? Reply to this email or contact support@rdistro.net

Welcome to RDistro!
The RDistro Team`
  },
  {
    id: 'missing-info',
    name: 'Missing Information',
    icon: '⚠️',
    subject: 'Missing Information - RDistro Registration',
    message: `Hi [NAME],

We noticed that some information is missing from your RDistro registration. To proceed with your account setup, please provide:

❌ MISSING:
• [LIST MISSING ITEMS]

Please reply to this email with the above information.

Thank you!
The RDistro Team`
  },
  {
    id: 'trial-reminder',
    name: 'Trial Reminder',
    icon: '⏰',
    subject: 'Your RDistro Free Trial Ends Soon',
    message: `Hi [NAME],

This is a friendly reminder that your RDistro free trial will end on [DATE].

After the trial ends, your saved card will be charged $20/year to continue your subscription and keep your music on all streaming platforms.

If you have any questions or wish to cancel before the trial ends, please reply to this email.

Thank you for being part of RDistro!
The RDistro Team`
  },
  {
    id: 'payment-issue',
    name: 'Payment Issue',
    icon: '💳',
    subject: 'Payment Issue - Action Required',
    message: `Hi [NAME],

We were unable to process your payment for your RDistro subscription.

Please update your payment method to continue using RDistro and keep your music on all streaming platforms.

To update your payment:
1. Contact us at support@rdistro.net
2. Or reply to this email

If you have any questions, we're here to help!

The RDistro Team`
  },
]

interface SentEmail {
  id: string
  from: string
  to: string
  subject: string
  status: 'sent' | 'failed'
  sentAt: string
}

export default function EmailsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  // Compose email state
  const [showCompose, setShowCompose] = useState(false)
  const [fromEmail, setFromEmail] = useState('registration@rdistro.net')
  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Sent emails history
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])

  // Check for saved session on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      fetch('/api/admin/registrations', {
        headers: { 'Authorization': `Basic ${btoa(`admin:${savedPassword}`)}` }
      }).then(res => {
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          sessionStorage.removeItem('adminPassword')
        }
        setCheckingAuth(false)
      }).catch(() => {
        sessionStorage.removeItem('adminPassword')
        setCheckingAuth(false)
      })
    } else {
      setCheckingAuth(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': `Basic ${btoa(`admin:${password}`)}` }
      })
      if (res.ok) {
        sessionStorage.setItem('adminPassword', password)
        setIsAuthenticated(true)
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendStatus(null)

    const pwd = password || sessionStorage.getItem('adminPassword') || ''
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`admin:${pwd}`)}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject,
          message,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSendStatus({ type: 'success', message: 'Email sent successfully!' })
        setSentEmails(prev => [{
          id: Date.now().toString(),
          from: fromEmail,
          to: toEmail,
          subject,
          status: 'sent',
          sentAt: new Date().toISOString(),
        }, ...prev])
        // Reset form
        setToEmail('')
        setSubject('')
        setMessage('')
        setShowCompose(false)
      } else {
        setSendStatus({ type: 'error', message: data.error || 'Failed to send email' })
      }
    } catch {
      setSendStatus({ type: 'error', message: 'Network error' })
    } finally {
      setSending(false)
    }
  }

  // Show loading while checking saved auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
        <div className="text-center">
          <Logo className="w-10 h-10 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
        <div className="card p-5 w-full max-w-xs">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-[var(--text)]">Email Admin</span>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field text-sm mb-3"
              autoFocus
            />
            {error && <p className="text-xs text-error mb-3">{error}</p>}
            <button type="submit" disabled={loading || !password} className="btn-primary w-full text-sm">
              {loading ? '...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <span className="font-bold text-[var(--text)]">RDistro</span>
            <span className="badge text-[10px]">Emails</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-primary hover:underline">
              ← Dashboard
            </Link>
            <button onClick={() => { sessionStorage.removeItem('adminPassword'); setIsAuthenticated(false); }} className="text-xs text-[var(--text-muted)]">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Status Message */}
        {sendStatus && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            sendStatus.type === 'success' 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-error/10 text-error border border-error/20'
          }`}>
            {sendStatus.type === 'success' ? '✓' : '⚠'} {sendStatus.message}
          </div>
        )}

        {/* Email Accounts */}
        <div className="card mb-4">
          <div className="p-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--text)]">📧 Email Accounts</h2>
            <p className="text-[10px] text-[var(--text-muted)]">Hosted on Hostinger • Send via Resend</p>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EMAIL_ACCOUNTS.map((account) => (
                <div 
                  key={account.email} 
                  className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setFromEmail(account.email)
                    setShowCompose(true)
                  }}
                >
                  <div className="text-2xl mb-2">{account.icon}</div>
                  <p className="text-sm font-medium text-[var(--text)]">{account.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{account.email}</p>
                  <p className="text-[9px] text-primary mt-1">{account.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setShowCompose(true)}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              >
                ✉️ Compose Email
              </button>
              <a
                href="https://mail.hostinger.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm py-2 px-4"
              >
                Open Hostinger Mail →
              </a>
            </div>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="card mb-4">
          <div className="p-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--text)]">📋 Quick Templates</h2>
            <p className="text-[10px] text-[var(--text-muted)]">Pre-written email templates for common scenarios</p>
          </div>
          <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {EMAIL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSubject(template.subject)
                  setMessage(template.message)
                  setFromEmail('registration@rdistro.net')
                  setShowCompose(true)
                }}
                className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="text-xl mb-1">{template.icon}</div>
                <p className="text-xs font-medium text-[var(--text)] leading-tight">{template.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Compose Email Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--text)]">✉️ Compose Email</h3>
                <button onClick={() => setShowCompose(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSendEmail} className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">From</label>
                  <select
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="input-field text-sm"
                  >
                    {EMAIL_ACCOUNTS.map((account) => (
                      <option key={account.email} value={account.email}>
                        {account.label} &lt;{account.email}&gt;
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">To</label>
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={8}
                    className="input-field text-sm resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary flex-1 text-sm py-2.5"
                  >
                    {sending ? 'Sending...' : '📤 Send Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="btn-secondary px-4 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sent Emails History */}
        <div className="card">
          <div className="p-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--text)]">📤 Recently Sent</h2>
          </div>
          
          {sentEmails.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--text-muted)]">
              No emails sent this session
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {sentEmails.map((email) => (
                <div key={email.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{email.subject}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        From: {email.from} → To: {email.to}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge text-[10px] ${email.status === 'sent' ? 'badge-success' : 'badge-error'}`}>
                        {email.status === 'sent' ? '✓ Sent' : '✕ Failed'}
                      </span>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1">
                        {new Date(email.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="text-sm font-medium text-[var(--text)] mb-2">ℹ️ Email Setup Info</h3>
          <ul className="text-xs text-[var(--text-muted)] space-y-1">
            <li>• <strong>Receiving emails:</strong> Use Hostinger Webmail at <a href="https://mail.hostinger.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">mail.hostinger.com</a></li>
            <li>• <strong>Sending emails:</strong> Uses Resend API for reliable delivery</li>
            <li>• <strong>Domain verified:</strong> rdistro.net is configured in Resend</li>
            <li>• <strong>Replies:</strong> Customers reply to your Hostinger inbox</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

