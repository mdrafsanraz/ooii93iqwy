'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'

const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to customers after successful registration',
    subject: '🎉 Welcome to RDistro - Registration Successful!',
    category: 'Onboarding',
    icon: '🎉',
  },
  {
    id: 'trial-welcome',
    name: 'Free Trial Welcome',
    description: 'Sent to customers who start a free trial',
    subject: '🎁 Your Free Trial Has Started - RDistro',
    category: 'Onboarding',
    icon: '🎁',
  },
  {
    id: 'account-ready',
    name: 'Account Ready',
    description: 'Sent when customer account is created and ready to use',
    subject: '🚀 Your RDistro Account is Ready!',
    category: 'Onboarding',
    icon: '🚀',
  },
  {
    id: 'payment-received',
    name: 'Payment Received',
    description: 'Confirmation of successful payment',
    subject: '💳 Payment Received - RDistro',
    category: 'Billing',
    icon: '💳',
  },
  {
    id: 'trial-ending',
    name: 'Trial Ending Soon',
    description: 'Reminder that free trial is about to end',
    subject: '⏰ Your Free Trial Ends Soon - RDistro',
    category: 'Billing',
    icon: '⏰',
  },
  {
    id: 'release-live',
    name: 'Release is Live',
    description: 'Notify customer their release is now on streaming platforms',
    subject: '🎵 Your Release is Now Live! - RDistro',
    category: 'Updates',
    icon: '🎵',
  },
  {
    id: 'support-response',
    name: 'Support Response',
    description: 'Reply to customer support inquiry',
    subject: 'Re: Your Support Request - RDistro',
    category: 'Support',
    icon: '💬',
  },
]

const CATEGORIES = ['All', 'Onboarding', 'Billing', 'Updates', 'Support']

const EMAIL_ACCOUNTS = [
  { email: 'registration@rdistro.net', label: 'Registration' },
  { email: 'support@rdistro.net', label: 'Support' },
  { email: 'fatama@rdistro.net', label: 'Fatama' },
  { email: 'rafsan@rdistro.net', label: 'Rafsan' },
]

export default function TemplatesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof EMAIL_TEMPLATES[0] | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [fromEmail, setFromEmail] = useState('registration@rdistro.net')
  const [toEmail, setToEmail] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

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

  const handleUseTemplate = (template: typeof EMAIL_TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setCustomSubject(template.subject)
    setCustomMessage(getTemplateContent(template.id))
    setShowSendModal(true)
  }

  const getTemplateContent = (templateId: string) => {
    const templates: Record<string, string> = {
      'welcome': `Hi [Customer Name],

🎉 Welcome to RDistro!

We're thrilled to have you join our music distribution family. Your registration has been successfully received and your account is being prepared.

What happens next:
• Your account will be ready within 24-48 hours
• You'll receive your login credentials via email
• Once logged in, you can start uploading your music

Your music will be distributed to:
✓ Spotify
✓ Apple Music
✓ YouTube Music
✓ Amazon Music
✓ And 150+ more platforms

If you have any questions, don't hesitate to reach out!

Welcome aboard! 🎵

Best regards,
The RDistro Team`,

      'trial-welcome': `Hi [Customer Name],

🎁 Your free trial has been activated!

Great news - you now have 30 days to explore RDistro's full features absolutely free.

Trial Details:
• Duration: 30 days
• Plan: Label Plan
• Trial ends: [Trial End Date]
• After trial: $20/year (auto-charged)

What you get:
✓ Unlimited releases
✓ Distribution to 150+ platforms
✓ Keep 100% of your royalties
✓ Real-time analytics

Your account is being set up and you'll receive login credentials within 24-48 hours.

Enjoy your trial! 🎵

Best regards,
The RDistro Team`,

      'account-ready': `Hi [Customer Name],

🚀 Your RDistro account is ready!

Great news - your account has been created and you can now start distributing your music worldwide.

Your Login Details:
• Dashboard: https://app.rdistro.net
• Email: [Customer Email]
• Password: [Temporary Password]

First steps:
1. Log in to your dashboard
2. Complete your artist/label profile
3. Upload your first release
4. Submit for distribution

Need help getting started? Check out our guides or contact support.

Let's get your music out there! 🎵

Best regards,
The RDistro Team`,

      'payment-received': `Hi [Customer Name],

💳 Payment Received!

Thank you for your payment. Here's your receipt:

Payment Details:
• Amount: $[Amount]
• Plan: [Plan Name]
• Date: [Payment Date]
• Transaction ID: [Transaction ID]

Your subscription is now active. You can continue enjoying all RDistro features.

Thank you for choosing RDistro! 🎵

Best regards,
The RDistro Team`,

      'trial-ending': `Hi [Customer Name],

⏰ Your free trial is ending soon!

Just a friendly reminder that your RDistro free trial ends on [Trial End Date].

What happens next:
• Your card will be charged $20/year automatically
• Your account will continue without interruption
• All your releases will stay live

Want to continue? No action needed - we'll handle everything.

Need to cancel? Reply to this email before your trial ends.

Thank you for trying RDistro! 🎵

Best regards,
The RDistro Team`,

      'release-live': `Hi [Customer Name],

🎵 Your release is NOW LIVE!

Exciting news - "[Release Name]" is now available on streaming platforms!

Where to find it:
• Spotify: [Spotify Link]
• Apple Music: [Apple Music Link]
• YouTube Music: [YouTube Link]

Note: Some platforms may take up to 24-48 hours to fully display your release.

Share your music with the world! Don't forget to promote on your social media.

Congratulations! 🎉

Best regards,
The RDistro Team`,

      'support-response': `Hi [Customer Name],

Thank you for contacting RDistro Support.

[Your response here]

If you have any other questions, feel free to reply to this email.

Best regards,
[Your Name]
RDistro Support Team`,
    }
    return templates[templateId] || ''
  }

  const handleSendEmail = async () => {
    if (!toEmail || !customSubject || !customMessage) {
      setSendStatus({ type: 'error', message: 'Please fill all fields' })
      return
    }

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
          subject: customSubject,
          message: customMessage,
        }),
      })

      if (res.ok) {
        setSendStatus({ type: 'success', message: 'Email sent successfully!' })
        setTimeout(() => {
          setShowSendModal(false)
          setToEmail('')
          setSendStatus(null)
        }, 2000)
      } else {
        const data = await res.json()
        setSendStatus({ type: 'error', message: data.error || 'Failed to send' })
      }
    } catch {
      setSendStatus({ type: 'error', message: 'Network error' })
    } finally {
      setSending(false)
    }
  }

  const filteredTemplates = selectedCategory === 'All' 
    ? EMAIL_TEMPLATES 
    : EMAIL_TEMPLATES.filter(t => t.category === selectedCategory)

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
            <span className="font-bold text-[var(--text)]">Templates</span>
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
            <span className="badge text-[10px]">Templates</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-primary hover:underline">
              ← Dashboard
            </Link>
            <Link href="/admin/emails" className="text-xs text-primary hover:underline">
              📧 Emails
            </Link>
            <button onClick={() => { sessionStorage.removeItem('adminPassword'); setIsAuthenticated(false); }} className="text-xs text-[var(--text-muted)]">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text)] mb-1">📋 Email Templates</h1>
          <p className="text-sm text-[var(--text-muted)]">Pre-designed email templates for customer communication</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white border border-[var(--border)] text-[var(--text-muted)] hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="card p-4 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--text)] text-sm">{template.name}</h3>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {template.category}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-3">{template.description}</p>
              <p className="text-[11px] text-[var(--text)] bg-[var(--surface)] p-2 rounded-lg truncate">
                {template.subject}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                  className="btn-primary text-xs py-1.5 px-3 flex-1"
                >
                  Use Template
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {selectedTemplate && !showSendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="font-bold text-[var(--text)]">{selectedTemplate.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{selectedTemplate.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="text-[var(--text-muted)] hover:text-[var(--text)] text-xl">
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Subject</label>
                  <p className="text-sm text-[var(--text)] bg-[var(--surface)] p-3 rounded-lg">{selectedTemplate.subject}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Content Preview</label>
                  <pre className="text-sm text-[var(--text)] bg-[var(--surface)] p-4 rounded-lg whitespace-pre-wrap font-sans leading-relaxed">
                    {getTemplateContent(selectedTemplate.id)}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="btn-primary flex-1 text-sm py-2.5"
                  >
                    ✉️ Use This Template
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="btn-secondary px-4 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Email Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--text)]">✉️ Send Email</h3>
                <button onClick={() => { setShowSendModal(false); setSendStatus(null); }} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  ✕
                </button>
              </div>
              
              <div className="p-4 space-y-3">
                {sendStatus && (
                  <div className={`p-3 rounded-lg text-sm ${
                    sendStatus.type === 'success' 
                      ? 'bg-success/10 text-success border border-success/20' 
                      : 'bg-error/10 text-error border border-error/20'
                  }`}>
                    {sendStatus.type === 'success' ? '✓' : '⚠'} {sendStatus.message}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">From</label>
                  <select
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="input-field text-sm"
                  >
                    {EMAIL_ACCOUNTS.map((acc) => (
                      <option key={acc.email} value={acc.email}>
                        {acc.label} &lt;{acc.email}&gt;
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
                    placeholder="customer@example.com"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">Subject</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">Message</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={12}
                    className="input-field text-sm resize-none font-mono"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Replace [placeholders] with actual values before sending
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSendEmail}
                    disabled={sending}
                    className="btn-primary flex-1 text-sm py-2.5"
                  >
                    {sending ? 'Sending...' : '📤 Send Email'}
                  </button>
                  <button
                    onClick={() => { setShowSendModal(false); setSendStatus(null); }}
                    className="btn-secondary px-4 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

