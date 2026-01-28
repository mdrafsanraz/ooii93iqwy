import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

const SETTINGS_COLLECTION = 'settings'
const SETTINGS_DOC_ID = 'app_settings'

interface AppSettings {
  settingsId: string
  trialEnabled: boolean
  updatedAt?: string
}

// Simple admin auth check
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword || !authHeader) return false
  
  const [type, credentials] = authHeader.split(' ')
  if (type !== 'Basic') return false
  
  try {
    const decoded = Buffer.from(credentials, 'base64').toString()
    const [, password] = decoded.split(':')
    return password === adminPassword
  } catch {
    return false
  }
}

// Default settings
const defaultSettings = {
  trialEnabled: true,
}

// GET - Fetch settings (public for checking trial status)
export async function GET() {
  try {
    const db = await getDatabase()
    const settings = await db.collection<AppSettings>(SETTINGS_COLLECTION).findOne({ settingsId: SETTINGS_DOC_ID })
    
    return NextResponse.json({
      trialEnabled: settings?.trialEnabled ?? defaultSettings.trialEnabled,
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    // Return defaults on error
    return NextResponse.json(defaultSettings)
  }
}

// PATCH - Update settings (admin only)
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const updates = await request.json()
    
    const db = await getDatabase()
    await db.collection<AppSettings>(SETTINGS_COLLECTION).updateOne(
      { settingsId: SETTINGS_DOC_ID },
      { 
        $set: {
          settingsId: SETTINGS_DOC_ID,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      },
      { upsert: true }
    )
    
    console.log('Settings updated:', updates)
    
    return NextResponse.json({ success: true, settings: updates })
  } catch (error) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
