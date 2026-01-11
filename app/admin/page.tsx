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

  // Check for saved session on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      // Verify the saved password is still valid
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

  // Apply all filters
  const getFilteredRegistrations = () => {
    return registrations.filter(reg => {
      // Payment filter
      if (paymentFilter === 'paid' && (reg.freeTrial || reg.paymentStatus !== 'succeeded')) return false
      if (paymentFilter === 'trial' && !reg.freeTrial) return false
      
      // Type filter
      if (typeFilter === 'artist' && reg.plan !== 'artist') return false
      if (typeFilter === 'label' && reg.plan !== 'label') return false
      
      // Status filter
      if (statusFilter === 'pending' && reg.accountCreated) return false
      if (statusFilter === 'done' && !reg.accountCreated) return false
      
      return true
    })
  }

  const filteredRegistrations = getFilteredRegistrations()

  // Export filtered registrations as import-template.csv
  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export with current filters')
      return
    }

    // CSV format matching user's template
    const headers = ['Email', 'Account Type (Label or Artist)']
    const rows = filteredRegistrations.map(reg => [
      reg.email,
      reg.plan === 'label' ? 'Label' : 'Artist'
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download file
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
      // Fetch data immediately when authenticated
      fetchData()
      // Then refresh every 30 seconds
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchData])

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

  // Get color class based on trial end date urgency
  const getTrialDateColor = (trialEndDate: string) => {
    const now = new Date()
    const endDate = new Date(trialEndDate)
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) {
      return 'text-error font-bold' // Expired - Red
    } else if (daysLeft <= 3) {
      return 'text-error' // Less than 3 days - Red
    } else if (daysLeft <= 7) {
      return 'text-warning font-medium' // Less than 7 days - Orange/Yellow
    } else if (daysLeft <= 14) {
      return 'text-warning' // Less than 14 days - Yellow
    } else {
      return 'text-success' // More than 14 days - Green
    }
  }

  const getTrialDaysLabel = (trialEndDate: string) => {
    const now = new Date()
    const endDate = new Date(trialEndDate)
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) {
      return `(${Math.abs(daysLeft)}d overdue)`
    } else if (daysLeft === 0) {
      return '(today!)'
    } else if (daysLeft === 1) {
      return '(tomorrow)'
    } else {
      return `(${daysLeft}d left)`
    }
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
        {/* Error Display */}
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

        {/* Quick Email Access */}
        <Link href="/admin/emails" className="card mb-4 p-3 flex items-center justify-between hover:border-primary/50 transition-colors block">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">Email Management</p>
              <p className="text-[10px] text-[var(--text-muted)]">Send emails to customers via Resend</p>
            </div>
          </div>
          <span className="text-primary text-sm">Open →</span>
        </Link>

        {/* Filters */}
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            {/* Payment Filter */}
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

            {/* Type Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-muted)] mr-1">Type:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'artist', label: `🎤 Artist (${artistCount})` },
                { key: 'label', label: `🏢 Label (${labelCount})` },
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

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-muted)] mr-1">Status:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: `⏳ Pending (${pendingCount})` },
                { key: 'done', label: `✓ Done (${doneCount})` },
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

          {/* Export Button */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[var(--text-muted)]">
              Showing {filteredRegistrations.length} of {registrations.length} registrations
            </p>
            <button
              onClick={exportToCSV}
              disabled={filteredRegistrations.length === 0}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Filtered ({filteredRegistrations.length})
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
            <div className="p-6 text-center text-sm text-[var(--text-muted)]">
              No registrations
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-2 p-3 bg-[var(--surface)] border-b border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                <div>Name / Email</div>
                <div>Type</div>
                <div>Payment</div>
                <div>Registered</div>
                <div>Expiry</div>
                <div>Status</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-[var(--border)]">
                {filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedRegistration(reg)}
                    className="grid grid-cols-6 gap-2 p-3 hover:bg-[var(--surface)] cursor-pointer items-center"
                  >
                    {/* Name / Email */}
                    <div>
                      <p className="text-sm font-medium text-[var(--text)] truncate">{reg.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{reg.email}</p>
                    </div>
                    
                    {/* Account Type */}
                    <div>
                      <span className={`badge text-[10px] ${reg.plan === 'label' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {reg.plan === 'label' ? '🏢 Label' : '🎤 Artist'}
                      </span>
                    </div>
                    
                    {/* Payment Status */}
                    <div>
                      {reg.freeTrial ? (
                        <span className="badge text-[10px] bg-secondary/10 text-secondary border-secondary/20">🎁 Trial</span>
                      ) : reg.paymentStatus === 'succeeded' ? (
                        <span className="badge badge-success text-[10px]">💳 Paid ${reg.amount}</span>
                      ) : (
                        <span className="badge badge-warning text-[10px]">{reg.paymentStatus}</span>
                      )}
                    </div>
                    
                    {/* Registration Date */}
                    <div className="text-xs text-[var(--text)]">
                      {new Date(reg.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    
                    {/* Expiry Date */}
                    <div className="text-xs">
                      {reg.freeTrial && reg.trialEndDate ? (
                        <div className={getTrialDateColor(reg.trialEndDate)}>
                          <div>
                            {new Date(reg.trialEndDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-[9px]">
                            {getTrialDaysLabel(reg.trialEndDate)}
                          </div>
                        </div>
                      ) : reg.paymentStatus === 'succeeded' ? (
                        <span className="text-[var(--text-muted)]">
                          {new Date(new Date(reg.createdAt).setFullYear(new Date(reg.createdAt).getFullYear() + 1)).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </div>
                    
                    {/* Account Status */}
                    <div>
                      <span className={`badge text-[10px] ${reg.accountCreated ? 'badge-success' : 'badge-warning'}`}>
                        {reg.accountCreated ? '✓ Done' : '⏳ Pending'}
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

            {/* Trial Badge */}
            {selectedRegistration.freeTrial && (
              <div className="mb-3 p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
                <p className="text-xs font-medium text-secondary">🎁 Free Trial Active</p>
                {selectedRegistration.trialEndDate && (
                  <p className="text-[10px] text-secondary/80">
                    Card will be charged $20 on {new Date(selectedRegistration.trialEndDate).toLocaleDateString()}
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
                  <p className="font-medium">
                    {selectedRegistration.freeTrial ? '$0 (trial)' : `$${selectedRegistration.amount}`}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {selectedRegistration.plan === 'artist' ? 'Artist' : 'Label'}
                </p>
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
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {selectedRegistration.freeTrial ? '📱 Facebook/Instagram (Required)' : 'Social Links'}
                  </p>
                  <p className="text-xs">{selectedRegistration.socialLinks}</p>
                </div>
              )}

              {selectedRegistration.spotifyLink && (
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    🎵 Spotify/Music Link {selectedRegistration.freeTrial && '(Required)'}
                  </p>
                  <a 
                    href={selectedRegistration.spotifyLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary break-all hover:underline"
                  >
                    {selectedRegistration.spotifyLink}
                  </a>
                </div>
              )}

              <div>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {selectedRegistration.freeTrial ? 'Setup ID' : 'Payment ID'}
                </p>
                <p className="text-[10px] font-mono break-all">{selectedRegistration.paymentIntentId}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Payment</p>
                  <span className={`badge text-[10px] ${
                    selectedRegistration.freeTrial 
                      ? 'bg-secondary/10 text-secondary border-secondary/20'
                      : selectedRegistration.paymentStatus === 'succeeded' 
                      ? 'badge-success' 
                      : 'badge-warning'
                  }`}>
                    {selectedRegistration.freeTrial ? 'Trial' : selectedRegistration.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Account</p>
                  <span className={`badge text-[10px] ${selectedRegistration.accountCreated ? 'badge-success' : 'badge-warning'}`}>
                    {selectedRegistration.accountCreated ? 'Created' : 'Pending'}
                  </span>
                </div>
              </div>

              {selectedRegistration.freeTrial && selectedRegistration.trialEndDate && (
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Trial Ends</p>
                  <p className="text-xs text-warning">{new Date(selectedRegistration.trialEndDate).toLocaleString()}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Registered</p>
                <p className="text-xs">{new Date(selectedRegistration.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)] flex gap-2">
              {!selectedRegistration.accountCreated && (
                <button onClick={() => markAccountCreated(selectedRegistration.id)} className="btn-primary flex-1 text-sm py-2">
                  Mark Created
                </button>
              )}
              <button onClick={() => setSelectedRegistration(null)} className="btn-secondary flex-1 text-sm py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
