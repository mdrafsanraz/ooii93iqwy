'use client'

import { useState, useEffect, useCallback } from 'react'
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
  paymentIntentId: string
  amount: number
  paymentStatus: 'succeeded' | 'pending' | 'failed'
  createdAt: string
  accountCreated: boolean
}

interface Stats {
  total: number
  pending: number
  completed: number
  revenue: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, completed: 0, revenue: 0 })
  const [loading, setLoading] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': `Basic ${btoa(`admin:${password}`)}` }
      })
      if (res.status === 401) {
        setIsAuthenticated(false)
        return
      }
      const data = await res.json()
      setRegistrations(data.registrations)
      setStats(data.stats)
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

  // Export successful/paid registrations as CSV
  const exportToCSV = () => {
    const paidRegistrations = registrations.filter(r => r.paymentStatus === 'succeeded')
    
    if (paidRegistrations.length === 0) {
      alert('No paid registrations to export')
      return
    }

    // CSV headers
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Country',
      'Plan',
      'Artist/Label Name',
      'Social Links',
      'Amount',
      'Payment Status',
      'Account Created',
      'Registration Date',
      'Payment ID'
    ]

    // CSV rows
    const rows = paidRegistrations.map(reg => [
      reg.name,
      reg.email,
      reg.phone,
      reg.country,
      reg.plan,
      reg.artistName || reg.labelName || '',
      reg.socialLinks || '',
      `$${reg.amount}`,
      reg.paymentStatus,
      reg.accountCreated ? 'Yes' : 'No',
      new Date(reg.createdAt).toLocaleDateString(),
      reg.paymentIntentId
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rdistro-registrations-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export emails only
  const exportEmailsOnly = () => {
    const paidRegistrations = registrations.filter(r => r.paymentStatus === 'succeeded')
    
    if (paidRegistrations.length === 0) {
      alert('No paid registrations to export')
      return
    }

    // Simple email list format
    const headers = ['Email', 'Name', 'Plan']
    const rows = paidRegistrations.map(reg => [
      reg.email,
      reg.name,
      reg.plan
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rdistro-emails-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchData])

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

  const paidCount = registrations.filter(r => r.paymentStatus === 'succeeded').length

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <span className="font-bold text-[var(--text)]">RDistro</span>
            <span className="badge text-[10px]">Admin</span>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs text-[var(--text-muted)]">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-[var(--text)]' },
            { label: 'Pending', value: stats.pending, color: 'text-warning' },
            { label: 'Done', value: stats.completed, color: 'text-success' },
            { label: 'Revenue', value: `$${stats.revenue}`, color: 'text-primary' },
          ].map((s) => (
            <div key={s.label} className="card p-3 text-center">
              <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportToCSV}
            disabled={paidCount === 0}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export All ({paidCount})
          </button>
          <button
            onClick={exportEmailsOnly}
            disabled={paidCount === 0}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Export Emails
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[var(--text)]">Registrations</h2>
            <button onClick={fetchData} disabled={loading} className="text-xs text-primary">
              {loading ? '...' : 'Refresh'}
            </button>
          </div>

          {registrations.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--text-muted)]">
              No registrations yet
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegistration(reg)}
                  className="p-3 hover:bg-[var(--surface)] cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">{reg.name}</span>
                      <span className="badge text-[10px] capitalize">{reg.plan}</span>
                      {reg.paymentStatus === 'succeeded' && (
                        <span className="badge badge-success text-[10px]">Paid</span>
                      )}
                    </div>
                    <span className={`badge text-[10px] ${reg.accountCreated ? 'badge-success' : 'badge-warning'}`}>
                      {reg.accountCreated ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    <span>{reg.email}</span>
                    <span>${reg.amount}</span>
                    <span>{new Date(reg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
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

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Plan</p>
                  <p className="font-medium capitalize">{selectedRegistration.plan}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Amount</p>
                  <p className="font-medium">${selectedRegistration.amount}</p>
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
                  <p className="text-[10px] text-[var(--text-muted)]">Social</p>
                  <p className="text-xs">{selectedRegistration.socialLinks}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Payment ID</p>
                <p className="text-[10px] font-mono break-all">{selectedRegistration.paymentIntentId}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Payment</p>
                  <span className={`badge text-[10px] ${
                    selectedRegistration.paymentStatus === 'succeeded' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {selectedRegistration.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Account</p>
                  <span className={`badge text-[10px] ${selectedRegistration.accountCreated ? 'badge-success' : 'badge-warning'}`}>
                    {selectedRegistration.accountCreated ? 'Created' : 'Pending'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Date</p>
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
