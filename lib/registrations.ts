import { getDatabase } from './mongodb'
import { ObjectId } from 'mongodb'

// Registration data types
export interface Registration {
  _id?: ObjectId
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
  // Subscription tracking
  subscriptionId?: string
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'cancelled'
  lastPaymentDate?: string
  lastPaymentAmount?: number
}

const COLLECTION = 'registrations'

export async function addRegistration(data: Omit<Registration, 'id' | 'createdAt' | 'accountCreated'>): Promise<Registration> {
  try {
    const db = await getDatabase()
    const collection = db.collection<Registration>(COLLECTION)
    
    const registration: Registration = {
      ...data,
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      accountCreated: false,
    }
    
    await collection.insertOne(registration)
    console.log('Registration added:', registration.id)
    return registration
  } catch (error) {
    console.error('Error adding registration:', error)
    throw error
  }
}

export async function getRegistrations(): Promise<Registration[]> {
  try {
    const db = await getDatabase()
    const collection = db.collection<Registration>(COLLECTION)
    
    const registrations = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    console.log('Fetched registrations count:', registrations.length)
    return registrations
  } catch (error) {
    console.error('Error getting registrations:', error)
    throw error
  }
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  try {
    const db = await getDatabase()
    const collection = db.collection<Registration>(COLLECTION)
    
    return await collection.findOne({ id })
  } catch (error) {
    console.error('Error getting registration by id:', error)
    throw error
  }
}

export async function updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | null> {
  try {
    const db = await getDatabase()
    const collection = db.collection<Registration>(COLLECTION)
    
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    )
    
    console.log('Registration updated:', id)
    return result
  } catch (error) {
    console.error('Error updating registration:', error)
    throw error
  }
}

export async function getStats() {
  try {
    const db = await getDatabase()
    const collection = db.collection<Registration>(COLLECTION)
    
    const registrations = await collection.find({}).toArray()
    
    const total = registrations.length
    const pending = registrations.filter(r => !r.accountCreated).length
    const completed = registrations.filter(r => r.accountCreated).length
    const trials = registrations.filter(r => r.freeTrial).length
    const revenue = registrations
      .filter(r => r.paymentStatus === 'succeeded')
      .reduce((sum, r) => sum + r.amount, 0)
    
    return { total, pending, completed, revenue, trials }
  } catch (error) {
    console.error('Error getting stats:', error)
    throw error
  }
}
