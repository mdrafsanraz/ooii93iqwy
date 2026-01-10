// Registration data types
export interface Registration {
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

// In-memory storage (for demo - in production use a database)
// This will reset on server restart
let registrations: Registration[] = []

export function addRegistration(data: Omit<Registration, 'id' | 'createdAt' | 'accountCreated'>): Registration {
  const registration: Registration = {
    ...data,
    id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    accountCreated: false,
  }
  registrations.unshift(registration) // Add to beginning
  return registration
}

export function getRegistrations(): Registration[] {
  return registrations
}

export function getRegistrationById(id: string): Registration | undefined {
  return registrations.find(r => r.id === id)
}

export function updateRegistration(id: string, updates: Partial<Registration>): Registration | null {
  const index = registrations.findIndex(r => r.id === id)
  if (index === -1) return null
  registrations[index] = { ...registrations[index], ...updates }
  return registrations[index]
}

export function getStats() {
  const total = registrations.length
  const pending = registrations.filter(r => !r.accountCreated).length
  const completed = registrations.filter(r => r.accountCreated).length
  const revenue = registrations
    .filter(r => r.paymentStatus === 'succeeded')
    .reduce((sum, r) => sum + r.amount, 0)
  
  return { total, pending, completed, revenue }
}

