'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface Registration {
  id: string
  plan: 'artist' | 'label'
  name: string
  email: string
  phone: string
  country: string
  artistName?: string
  labelName?: string
  socialLinks?: string
  spotifyLink?: string
  paymentIntentId: string
  amount: number
  paymentStatus: 'succeeded' | 'pending' | 'failed' | 'trial'
  freeTrial: boolean
  trialEndDate?: string | null
  createdAt: string
  accountCreated: boolean
  subscriptionId?: string
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'cancelled'
  lastPaymentDate?: string
  lastPaymentAmount?: number
}

interface Stats {
  total: number
  pending: number
  completed: number
  revenue: number
  trials: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, completed: 0, revenue: 0, trials: 0 })
  const [loading, setLoading] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'trial'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'artist' | 'label'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [trialEnabled, setTrialEnabled] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

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

  const fetchData = useCallback(async () => {
    const pwd = password || sessionStorage.getItem('adminPassword') || ''
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': `Basic ${btoa(`admin:${pwd}`)}` }
      })
      if (res.status === 401) {
        setIsAuthenticated(false)
        sessionStorage.removeItem('adminPassword')
        return
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setError(`Server error: ${res.status} - ${errorData.error || 'Unknown error'}`)
        return
      }
      const data = await res.json()
      setRegistrations(data.registrations || [])
      setStats(data.stats || { total: 0, pending: 0, completed: 0, revenue: 0, trials: 0 })
    } catch {
      setError('Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [password])

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
        const data = await res.json()
        setRegistrations(data.registrations)
        setStats(data.stats)
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const markAccountCreated = async (id: string) => {
    try {
      await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`admin:${password}`)}`
        },
        body: JSON.stringify({ id, accountCreated: true })
      })
      fetchData()
      setSelectedRegistration(null)
    } catch {
      setError('Update failed')
    }
  }

  const deleteRegistration = async (id: string, cancelSubscription: boolean) => {
    if (!confirm(cancelSubscription 
      ? 'Are you sure you want to DELETE this registration AND CANCEL the Stripe subscription? This cannot be undone.'
      : 'Are you sure you want to DELETE this registration? The Stripe subscription will remain active.'
    )) {
      return
    }
    
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`admin:${password}`)}`
        },
        body: JSON.stringify({ id, cancelSubscription })
      })
      
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Delete failed')
        return
      }
      
      fetchData()
      setSelectedRegistration(null)
    } catch {
      setError('Delete failed')
    }
  }

  const cancelSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to CANCEL this user\'s Stripe subscription? They will lose access after the current period ends.')) {
      return
    }
    
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`admin:${password}`)}`
        },
        body: JSON.stringify({ id, action: 'cancel_subscription' })
      })
      
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Cancel failed')
        return
      }
      
      fetchData()
      setSelectedRegistration(null)
      alert('Subscription cancelled successfully')
    } catch {
      setError('Cancel failed')
    }
  }

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setTrialEnabled(data.trialEnabled ?? true)
      }
    } catch {
      console.error('Failed to fetch settings')
    }
  }, [])

  const toggleTrial = async () => {
    const pwd = password || sessionStorage.getItem('adminPassword') || ''
    setSavingSettings(true)
    try {
      const newValue = !trialEnabled
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`admin:${pwd}`)}`
        },
        body: JSON.stringify({ trialEnabled: newValue })
      })
      
      if (res.ok) {
        setTrialEnabled(newValue)
      } else {
        setError('Failed to update settings')
      }
    } catch {
      setError('Failed to update settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const getFilteredRegistrations = () => {
    return registrations.filter(reg => {
      if (paymentFilter === 'paid' && (reg.freeTrial || reg.paymentStatus !== 'succeeded')) return false
      if (paymentFilter === 'trial' && !reg.freeTrial) return false
      if (typeFilter === 'artist' && reg.plan !== 'artist') return false
      if (typeFilter === 'label' && reg.plan !== 'label') return false
      if (statusFilter === 'pending' && reg.accountCreated) return false
      if (statusFilter === 'done' && !reg.accountCreated) return false
      return true
    })
  }

  const filteredRegistrations = getFilteredRegistrations()

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export with current filters')
      return
    }

    const headers = ['Email', 'Account Type (Label or Artist)']
    const rows = filteredRegistrations.map(reg => [
      reg.email,
      reg.plan === 'label' ? 'Label' : 'Artist'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'import-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
      fetchSettings()
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchData, fetchSettings])

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
            <span className="font-bold text-[var(--text)]">Admin</span>
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

  const paidCount = registrations.filter(r => r.paymentStatus === 'succeeded' && !r.freeTrial).length
  const trialCount = registrations.filter(r => r.freeTrial).length
  const artistCount = registrations.filter(r => r.plan === 'artist').length
  const labelCount = registrations.filter(r => r.plan === 'label').length
  const pendingCount = registrations.filter(r => !r.accountCreated).length
  const doneCount = registrations.filter(r => r.accountCreated).length

  const getTrialDateColor = (trialEndDate: string) => {
    const now = new Date()
    const endDate = new Date(trialEndDate)
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) return 'text-error font-bold'
    if (daysLeft <= 3) return 'text-error'
    if (daysLeft <= 7) return 'text-warning font-medium'
    if (daysLeft <= 14) return 'text-warning'
    return 'text-success'
  }

  const getTrialDaysLabel = (trialEndDate: string) => {
    const now = new Date()
    const endDate = new Date(trialEndDate)
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) return `(${Math.abs(daysLeft)}d overdue)`
    if (daysLeft === 0) return '(today!)'
    if (daysLeft === 1) return '(tomorrow)'
    return `(${daysLeft}d left)`
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <span className="font-bold text-[var(--text)]">RDistro</span>
            <span className="badge text-[10px]">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/emails" className="text-xs text-primary hover:underline">
              📧 Emails
            </Link>
            <button onClick={() => { sessionStorage.removeItem('adminPassword'); setIsAuthenticated(false); }} className="text-xs text-[var(--text-muted)]">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-[var(--text)]' },
            { label: 'Pending', value: stats.pending, color: 'text-warning' },
            { label: 'Done', value: stats.completed, color: 'text-success' },
            { label: 'Trials', value: stats.trials, color: 'text-secondary' },
            { label: 'Revenue', value: `$${stats.revenue}`, color: 'text-primary' },
          ].map((s) => (
            <div key={s.label} className="card p-3 text-center">
              <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">🎁 Free Trial</p>
                <p className="text-[10px] text-[var(--text-muted)]">30-day trial for Labels</p>
              </div>
              <button
                onClick={toggleTrial}
                disabled={savingSettings}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  trialEnabled ? 'bg-success' : 'bg-gray-300'
                } ${savingSettings ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    trialEnabled ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <p className={`text-[10px] mt-2 ${trialEnabled ? 'text-success' : 'text-[var(--text-muted)]'}`}>
              {trialEnabled ? '✓ Enabled' : '✕ Disabled'}
            </p>
          </div>

          <Link href="/admin/emails" className="card p-3 sm:p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-xl">📧</span>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Emails</p>
                <p className="text-[10px] text-[var(--text-muted)]">Send emails via Resend</p>
              </div>
            </div>
            <span className="text-primary text-xs">Open →</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-muted)] mr-1">Payment:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'paid', label: `Paid (${paidCount})` },
                { key: 'trial', label: `Trial (${trialCount})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setPaymentFilter(f.key as typeof paymentFilter)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                    paymentFilter === f.key
                      ? 'bg-primary text-white'
                      : 'bg-[var(--surface-dark)] text-[var(--text-muted)] hover:bg-[var(--border)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-muted)] mr-1">Type:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'artist', label: `🎤 (${artistCount})` },
                { key: 'label', label: `🏢 (${labelCount})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key as typeof typeFilter)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                    typeFilter === f.key
                      ? 'bg-primary text-white'
                      : 'bg-[var(--surface-dark)] text-[var(--text-muted)] hover:bg-[var(--border)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-muted)] mr-1">Status:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: `⏳ (${pendingCount})` },
                { key: 'done', label: `✓ (${doneCount})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key as typeof statusFilter)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                    statusFilter === f.key
                      ? 'bg-primary text-white'
                      : 'bg-[var(--surface-dark)] text-[var(--text-muted)] hover:bg-[var(--border)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[var(--text-muted)]">
              Showing {filteredRegistrations.length} of {registrations.length}
            </p>
            <button onClick={exportToCSV} disabled={filteredRegistrations.length === 0} className="btn-secondary text-xs py-2 px-3">
              📥 Export ({filteredRegistrations.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[var(--text)]">Registrations</h2>
            <button onClick={fetchData} disabled={loading} className="text-xs text-primary">
              {loading ? '...' : 'Refresh'}
            </button>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--text-muted)]">No registrations</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-2 p-3 bg-[var(--surface)] border-b border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                <div>Name / Email</div>
                <div>Type</div>
                <div>Payment</div>
                <div>Registered</div>
                <div>Expiry</div>
                <div>Status</div>
              </div>
              
              <div className="divide-y divide-[var(--border)]">
                {filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedRegistration(reg)}
                    className="grid grid-cols-6 gap-2 p-3 hover:bg-[var(--surface)] cursor-pointer items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text)] truncate">{reg.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{reg.email}</p>
                    </div>
                    <div>
                      <span className={`badge text-[10px] ${reg.plan === 'label' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                        {reg.plan === 'label' ? '🏢' : '🎤'}
                      </span>
                    </div>
                    <div>
                      {reg.freeTrial ? (
                        <span className="badge text-[10px] bg-secondary/10 text-secondary">🎁 Trial</span>
                      ) : reg.paymentStatus === 'succeeded' ? (
                        <span className="badge badge-success text-[10px]">💳 ${reg.amount}</span>
                      ) : (
                        <span className="badge badge-warning text-[10px]">{reg.paymentStatus}</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text)]">
                      {new Date(reg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs">
                      {reg.freeTrial && reg.trialEndDate ? (
                        <div className={getTrialDateColor(reg.trialEndDate)}>
                          {new Date(reg.trialEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <div className="text-[9px]">{getTrialDaysLabel(reg.trialEndDate)}</div>
                        </div>
                      ) : '—'}
                    </div>
                    <div>
                      <span className={`badge text-[10px] ${reg.accountCreated ? 'badge-success' : 'badge-warning'}`}>
                        {reg.accountCreated ? '✓' : '⏳'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-[var(--text)]">{selectedRegistration.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{selectedRegistration.email}</p>
              </div>
              <button onClick={() => setSelectedRegistration(null)} className="text-[var(--text-muted)]">✕</button>
            </div>

            {selectedRegistration.freeTrial && (
              <div className="mb-3 p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
                <p className="text-xs font-medium text-secondary">🎁 Free Trial Active</p>
                {selectedRegistration.trialEndDate && (
                  <p className="text-[10px] text-secondary/80">
                    Charges $20 on {new Date(selectedRegistration.trialEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Plan</p>
                  <p className="font-medium capitalize">{selectedRegistration.plan}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Amount</p>
                  <p className="font-medium">{selectedRegistration.freeTrial ? '$0 (trial)' : `$${selectedRegistration.amount}`}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[var(--text-muted)]">{selectedRegistration.plan === 'artist' ? 'Artist' : 'Label'}</p>
                <p className="font-medium">{selectedRegistration.artistName || selectedRegistration.labelName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Phone</p>
                  <p>{selectedRegistration.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Country</p>
                  <p>{selectedRegistration.country}</p>
                </div>
              </div>

              {selectedRegistration.socialLinks && (
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Social Links</p>
                  <p className="text-xs">{selectedRegistration.socialLinks}</p>
                </div>
              )}

              {selectedRegistration.spotifyLink && (
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">🎵 Music Link</p>
                  <a href={selectedRegistration.spotifyLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary break-all hover:underline">
                    {selectedRegistration.spotifyLink}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-2">
              <div className="flex gap-2">
                {!selectedRegistration.accountCreated && (
                  <button onClick={() => markAccountCreated(selectedRegistration.id)} className="btn-primary flex-1 text-sm py-2">
                    ✓ Mark Created
                  </button>
                )}
                <button onClick={() => setSelectedRegistration(null)} className="btn-secondary flex-1 text-sm py-2">
                  Close
                </button>
              </div>
              
              {selectedRegistration.subscriptionId && selectedRegistration.subscriptionStatus !== 'cancelled' && (
                <button onClick={() => cancelSubscription(selectedRegistration.id)} className="w-full text-xs py-2 px-3 rounded-lg bg-warning/10 text-warning border border-warning/20">
                  ⚠️ Cancel Subscription
                </button>
              )}
              
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-muted)] mb-2">Danger Zone</p>
                <div className="flex gap-2">
                  <button onClick={() => deleteRegistration(selectedRegistration.id, false)} className="flex-1 text-xs py-2 rounded-lg bg-error/10 text-error border border-error/20">
                    🗑️ Delete
                  </button>
                  {selectedRegistration.subscriptionId && (
                    <button onClick={() => deleteRegistration(selectedRegistration.id, true)} className="flex-1 text-xs py-2 rounded-lg bg-error text-white">
                      🗑️ Delete + Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
