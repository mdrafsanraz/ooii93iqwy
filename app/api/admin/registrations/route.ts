import { NextRequest, NextResponse } from 'next/server'
import { getRegistrations, getStats, updateRegistration, deleteRegistration, getRegistrationById } from '@/lib/registrations'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

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

export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, cancelSubscription } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 })
    }
    
    const registration = await getRegistrationById(id)
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }
    
    if (cancelSubscription && registration.subscriptionId) {
      try {
        await stripe.subscriptions.cancel(registration.subscriptionId)
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError)
      }
    }
    
    const deleted = await deleteRegistration(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, action } = await request.json()
    
    if (action === 'cancel_subscription') {
      const registration = await getRegistrationById(id)
      
      if (!registration) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
      }
      
      if (!registration.subscriptionId) {
        return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
      }
      
      try {
        await stripe.subscriptions.cancel(registration.subscriptionId)
        await updateRegistration(id, { subscriptionStatus: 'cancelled', paymentStatus: 'failed' })
        return NextResponse.json({ success: true })
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError)
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
