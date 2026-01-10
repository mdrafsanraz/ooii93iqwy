import { NextRequest, NextResponse } from 'next/server'
import { getRegistrations, getStats, updateRegistration } from '@/lib/registrations'

// Simple admin auth check
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  if (!authHeader) return false
  
  const [type, credentials] = authHeader.split(' ')
  if (type !== 'Basic') return false
  
  const decoded = Buffer.from(credentials, 'base64').toString()
  const [, password] = decoded.split(':')
  
  return password === adminPassword
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const registrations = getRegistrations()
  const stats = getStats()
  
  return NextResponse.json({ registrations, stats })
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id, accountCreated } = await request.json()
  
  const updated = updateRegistration(id, { accountCreated })
  
  if (!updated) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }
  
  return NextResponse.json({ success: true, registration: updated })
}

