import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  const status: Record<string, string> = {
    timestamp: new Date().toISOString(),
    mongodb_uri: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
    admin_password: process.env.ADMIN_PASSWORD ? '✅ Set' : '❌ Missing',
    admin_email: process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing',
    resend_api_key: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
    stripe_secret: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
    stripe_public: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
  }

  // Test MongoDB connection
  try {
    const db = await getDatabase()
    const collections = await db.listCollections().toArray()
    status.mongodb_connection = '✅ Connected'
    status.mongodb_collections = collections.map(c => c.name).join(', ') || 'none'
  } catch (error) {
    status.mongodb_connection = '❌ Failed'
    status.mongodb_error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(status)
}
