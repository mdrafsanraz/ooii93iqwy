'use client'

import { useState, useEffect, useCallback } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'
import {
  ARTIST_PRICE_UPDATE_PLAIN,
  ARTIST_PRICE_UPDATE_SUBJECT,
  EXISTING_USER_PRICE_REASSURE_PLAIN,
  EXISTING_USER_PRICE_REASSURE_SUBJECT,
} from '@/lib/emailTemplates'

const EMAIL_ACCOUNTS = [
  { email: 'fatama@rdistro.net', label: 'Fatama', icon: '👤', description: 'Personal' },
  { email: 'rafsan@rdistro.net', label: 'Rafsan', icon: '👤', description: 'Personal' },
  { email: 'support@rdistro.net', label: 'Support', icon: '🎧', description: 'Customer Support' },
  { email: 'registration@rdistro.net', label: 'Registration', icon: '📝', description: 'New Signups' },
]

const BRANDED_API_TEMPLATE: Record<string, string> = {
  'artist-price-update': 'artist_price_update',
  'existing-user-price-reassure': 'existing_user_price_reassure',
}

const EMAIL_TEMPLATES = [
  {
    id: 'artist-price-update',
    name: 'Artist $10 Price Update',
    icon: '💰',
    subject: ARTIST_PRICE_UPDATE_SUBJECT,
    message: ARTIST_PRICE_UPDATE_PLAIN,
    branded: true as const,
  },
  {
    id: 'existing-user-price-reassure',
    name: 'Existing Users Not Affected',
    icon: '💚',
    subject: EXISTING_USER_PRICE_REASSURE_SUBJECT,
    message: EXISTING_USER_PRICE_REASSURE_PLAIN,
    branded: true as const,
  },
  {
    id: 'request-links',
    name: 'Request Links',
    icon: '🔗',
    subject: 'Action Required: Complete Your RDistro Onboarding',
    message: `Hi [NAME],

Thank you for starting your free trial with RDistro!

To complete your account setup, please provide:

📱 SOCIAL MEDIA LINKS
• Facebook: ____________________
• Instagram: ____________________

🎵 MUSIC LINKS
• Spotify: ____________________
• Other: ____________________

Please reply with this info.

Best regards,
The RDistro Team`,
    branded: false as const,
  },
  {
    id: 'account-ready',
    name: 'Account Ready',
    icon: '✅',
    subject: 'Your RDistro Account is Ready!',
    message: `Hi [NAME],

Your RDistro account is ready!

🔐 LOGIN DETAILS:
• URL: https://app.rdistro.net
• Email: [EMAIL]
• Password: [PASSWORD]

Welcome to RDistro!
The RDistro Team`,
    branded: false as const,
  },
  {
    id: 'trial-reminder',
    name: 'Trial Reminder',
    icon: '⏰',
    subject: 'Your RDistro Free Trial Ends Soon',
    message: `Hi [NAME],

Your RDistro free trial ends on [DATE].

Your card will be charged $20/year to continue.

Questions? Reply to this email.

The RDistro Team`,
    branded: false as const,
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

interface RegistrationOption {
  id: string
  name: string
  email: string
  plan: string
}

export default function EmailsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [showCompose, setShowCompose] = useState(false)
  const [fromEmail, setFromEmail] = useState('registration@rdistro.net')
  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [recipientMode, setRecipientMode] = useState<'one' | 'all'>('one')
  const [registrations, setRegistrations] = useState<RegistrationOption[]>([])
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])

  const authHeader = useCallback(() => {
    const pwd = password || sessionStorage.getItem('adminPassword') || ''
    return `Basic ${btoa(`admin:${pwd}`)}`
  }, [password])

  const loadRegistrations = useCallback(async (pwd?: string) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: {
          Authorization: `Basic ${btoa(`admin:${pwd || password || sessionStorage.getItem('adminPassword') || ''}`)}`,
        },
      })
      if (!res.ok) return
      const data = await res.json()
      const list: RegistrationOption[] = (data.registrations || []).map(
        (r: { id: string; name: string; email: string; plan: string }) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          plan: r.plan,
        })
      )
      // Unique by email
      const unique = Array.from(new Map(list.map((r) => [r.email.toLowerCase(), r])).values())
      setRegistrations(unique)
    } catch {
      // ignore
    }
  }, [password])

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      fetch('/api/admin/registrations', {
        headers: { Authorization: `Basic ${btoa(`admin:${savedPassword}`)}` },
      })
        .then((res) => {
          if (res.ok) {
            setIsAuthenticated(true)
            return res.json()
          }
          sessionStorage.removeItem('adminPassword')
          return null
        })
        .then((data) => {
          if (data?.registrations) {
            const list: RegistrationOption[] = data.registrations.map(
              (r: { id: string; name: string; email: string; plan: string }) => ({
                id: r.id,
                name: r.name,
                email: r.email,
                plan: r.plan,
              })
            )
            setRegistrations(
              Array.from(new Map(list.map((r) => [r.email.toLowerCase(), r])).values())
            )
          }
          setCheckingAuth(false)
        })
        .catch(() => {
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
        headers: { Authorization: `Basic ${btoa(`admin:${password}`)}` },
      })
      if (res.ok) {
        sessionStorage.setItem('adminPassword', password)
        setIsAuthenticated(true)
        await loadRegistrations(password)
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const openTemplate = (template: (typeof EMAIL_TEMPLATES)[number]) => {
    setActiveTemplate(template.id)
    setSubject(template.subject)
    setMessage(template.message)
    setRecipientMode('one')
    setShowCompose(true)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendStatus(null)

    const apiTemplate = activeTemplate ? BRANDED_API_TEMPLATE[activeTemplate] : undefined
    const isBranded = Boolean(apiTemplate)
    const templateLabel =
      EMAIL_TEMPLATES.find((t) => t.id === activeTemplate)?.name || 'this email'

    if (isBranded && recipientMode === 'all') {
      if (
        !confirm(
          `Send "${templateLabel}" to ALL ${registrations.length} registered users? This cannot be undone.`
        )
      ) {
        setSending(false)
        return
      }
    }

    try {
      const payload =
        isBranded && apiTemplate
          ? {
              from: fromEmail,
              template: apiTemplate,
              subject,
              sendToAll: recipientMode === 'all',
              ...(recipientMode === 'one' ? { to: toEmail } : {}),
            }
          : {
              from: fromEmail,
              to: toEmail,
              subject,
              message,
            }

      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader(),
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        const successMsg =
          isBranded && recipientMode === 'all'
            ? data.message || `Sent to ${data.sent}/${data.total} users`
            : 'Email sent!'

        setSendStatus({ type: 'success', message: successMsg })
        setSentEmails((prev) => [
          {
            id: Date.now().toString(),
            from: fromEmail,
            to: recipientMode === 'all' && isBranded ? `ALL USERS (${data.sent ?? 0})` : toEmail,
            subject,
            status: 'sent',
            sentAt: new Date().toISOString(),
          },
          ...prev,
        ])
        setToEmail('')
        setSubject('')
        setMessage('')
        setActiveTemplate(null)
        setShowCompose(false)
      } else {
        setSendStatus({ type: 'error', message: data.error || 'Failed' })
      }
    } catch {
      setSendStatus({ type: 'error', message: 'Network error' })
    } finally {
      setSending(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
        <div className="text-center">
          <Logo className="h-10 w-auto mx-auto mb-2 animate-pulse" />
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
            <Logo className="h-8 w-auto" />
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

  const isBranded = Boolean(activeTemplate && BRANDED_API_TEMPLATE[activeTemplate])
  const activeTemplateMeta = EMAIL_TEMPLATES.find((t) => t.id === activeTemplate)

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="font-bold text-[var(--text)]">RDistro</span>
            <span className="badge text-[10px]">Emails</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-primary hover:underline">
              ← Dashboard
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem('adminPassword')
                setIsAuthenticated(false)
              }}
              className="text-xs text-[var(--text-muted)]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {sendStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              sendStatus.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}
          >
            {sendStatus.type === 'success' ? '✓' : '⚠'} {sendStatus.message}
          </div>
        )}

        <div className="card mb-4">
          <div className="p-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--text)]">📧 Email Accounts</h2>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EMAIL_ACCOUNTS.map((account) => (
                <div
                  key={account.email}
                  className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-primary/50 cursor-pointer"
                  onClick={() => {
                    setFromEmail(account.email)
                    setActiveTemplate(null)
                    setShowCompose(true)
                  }}
                >
                  <div className="text-2xl mb-2">{account.icon}</div>
                  <p className="text-sm font-medium text-[var(--text)]">{account.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{account.email}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setActiveTemplate(null)
                  setShowCompose(true)
                }}
                className="btn-primary text-sm py-2 px-4"
              >
                ✉️ Compose Email
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="p-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--text)]">📋 Quick Templates</h2>
          </div>
          <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {EMAIL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => openTemplate(template)}
                className={`p-3 rounded-lg bg-[var(--surface)] border text-left hover:border-primary/50 ${
                  template.branded
                    ? template.id === 'existing-user-price-reassure'
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-amber-300 bg-amber-50/50'
                    : 'border-[var(--border)]'
                }`}
              >
                <div className="text-xl mb-1">{template.icon}</div>
                <p className="text-xs font-medium text-[var(--text)]">{template.name}</p>
                {template.branded && (
                  <p
                    className={`text-[10px] mt-1 ${
                      template.id === 'existing-user-price-reassure'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    Branded · 1 or all users
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {showCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--text)]">
                  {isBranded
                    ? `${activeTemplateMeta?.icon || ''} ${activeTemplateMeta?.name || 'Template'}`
                    : '✉️ Compose Email'}
                </h3>
                <button
                  onClick={() => {
                    setShowCompose(false)
                    setActiveTemplate(null)
                  }}
                  className="text-[var(--text-muted)]"
                >
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

                {isBranded && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-2">
                      Recipients
                    </label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setRecipientMode('one')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                          recipientMode === 'one'
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        Specific user
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipientMode('all')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                          recipientMode === 'all'
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        All users ({registrations.length})
                      </button>
                    </div>
                    {recipientMode === 'all' && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                        Will send this branded email to every unique registration email.
                      </p>
                    )}
                  </div>
                )}

                {(!isBranded || recipientMode === 'one') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">To</label>
                    <input
                      type="email"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="input-field text-sm"
                      required={!isBranded || recipientMode === 'one'}
                    />
                  </div>
                )}

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
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">
                    {isBranded ? 'Preview (branded HTML will be sent)' : 'Message'}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={isBranded ? 10 : 8}
                    className="input-field text-sm resize-none"
                    required={!isBranded}
                    readOnly={isBranded}
                  />
                  {isBranded && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Recipients get the full branded HTML template.
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={sending} className="btn-primary flex-1 text-sm py-2.5">
                    {sending
                      ? recipientMode === 'all' && isBranded
                        ? 'Sending to all…'
                        : 'Sending...'
                      : recipientMode === 'all' && isBranded
                        ? `📤 Send to all (${registrations.length})`
                        : '📤 Send'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompose(false)
                      setActiveTemplate(null)
                    }}
                    className="btn-secondary px-4 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    <span
                      className={`badge text-[10px] ${
                        email.status === 'sent' ? 'badge-success' : 'badge-error'
                      }`}
                    >
                      {email.status === 'sent' ? '✓ Sent' : '✕ Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
