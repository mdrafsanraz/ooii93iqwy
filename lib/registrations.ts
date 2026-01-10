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
  paymentIntentId: string
  amount: number
  paymentStatus: 'succeeded' | 'pending' | 'failed'
  createdAt: string
  accountCreated: boolean
}

const COLLECTION = 'registrations'

export async function addRegistration(data: Omit<Registration, 'id' | 'createdAt' | 'accountCreated'>): Promise<Registration> {
  const db = await getDatabase()
  const collection = db.collection<Registration>(COLLECTION)
  
  const registration: Registration = {
    ...data,
    id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    accountCreated: false,
  }
  
  await collection.insertOne(registration)
  return registration
}

export async function getRegistrations(): Promise<Registration[]> {
  const db = await getDatabase()
  const collection = db.collection<Registration>(COLLECTION)
  
  const registrations = await collection
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
  
  return registrations
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const db = await getDatabase()
  const collection = db.collection<Registration>(COLLECTION)
  
  return await collection.findOne({ id })
}

export async function updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | null> {
  const db = await getDatabase()
  const collection = db.collection<Registration>(COLLECTION)
  
  const result = await collection.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  )
  
  return result
}

export async function getStats() {
  const db = await getDatabase()
  const collection = db.collection<Registration>(COLLECTION)
  
  const registrations = await collection.find({}).toArray()
  
  const total = registrations.length
  const pending = registrations.filter(r => !r.accountCreated).length
  const completed = registrations.filter(r => r.accountCreated).length
  const revenue = registrations
    .filter(r => r.paymentStatus === 'succeeded')
    .reduce((sum, r) => sum + r.amount, 0)
  
  return { total, pending, completed, revenue }
}
