import { NextRequest, NextResponse } from 'next/server'
import { getRegistrations, getStats, updateRegistration } from '@/lib/registrations'

// Simple admin auth check
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD
  
  console.log('Admin auth check - Password env set:', !!adminPassword)
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set!')
    return false
  }
  
  if (!authHeader) {
    console.log('No authorization header')
    return false
  }
  
  const [type, credentials] = authHeader.split(' ')
  if (type !== 'Basic') {
    console.log('Auth type is not Basic:', type)
    return false
  }
  
  try {
    const decoded = Buffer.from(credentials, 'base64').toString()
    const [, password] = decoded.split(':')
    const isValid = password === adminPassword
    console.log('Password match:', isValid)
    return isValid
  } catch (e) {
    console.error('Error decoding auth:', e)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const registrations = await getRegistrations()
    const stats = await getStats()
    
    return NextResponse.json({ registrations, stats })
  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, accountCreated } = await request.json()
    
    const updated = await updateRegistration(id, { accountCreated })
    
    if (!updated) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, registration: updated })
  } catch (error) {
    console.error('Admin PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
