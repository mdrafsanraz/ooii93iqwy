import { NextRequest, NextResponse } from 'next/server'
import { getRegistrations, getStats, updateRegistration, deleteRegistration, getRegistrationById } from '@/lib/registrations'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

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

export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, cancelSubscription } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 })
    }
    
    // Get registration to find subscription ID
    const registration = await getRegistrationById(id)
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }
    
    // Cancel Stripe subscription if requested and exists
    if (cancelSubscription && registration.subscriptionId) {
      try {
        await stripe.subscriptions.cancel(registration.subscriptionId)
        console.log('Cancelled Stripe subscription:', registration.subscriptionId)
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError)
        // Continue with deletion even if Stripe cancellation fails
      }
    }
    
    // Delete registration from database
    const deleted = await deleteRegistration(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Registration deleted',
      subscriptionCancelled: cancelSubscription && registration.subscriptionId ? true : false
    })
  } catch (error) {
    console.error('Admin DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Cancel subscription only (without deleting registration)
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
        return NextResponse.json({ error: 'No subscription found for this registration' }, { status: 400 })
      }
      
      try {
        await stripe.subscriptions.cancel(registration.subscriptionId)
        
        // Update registration status
        await updateRegistration(id, { 
          subscriptionStatus: 'cancelled',
          paymentStatus: 'failed'
        })
        
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription cancelled successfully'
        })
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError)
        return NextResponse.json({ error: 'Failed to cancel subscription in Stripe' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
