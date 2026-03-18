import { getDatabase } from './mongodb'
import type { Registration } from './registrations'

export type InviteSyncStatus = 'pending' | 'sent' | 'failed'

const DEFAULT_INVITE_API_URL = 'https://admin.rdistro.net/api/users/invite'

type SyncInviteParams = {
  registrationId: string
  email: string
  plan: Registration['plan']
  force?: boolean
}

function getInviteApiUrl(): string {
  return process.env.ADMIN_INVITE_API_URL || DEFAULT_INVITE_API_URL
}

function getInviteToken(): string {
  return process.env.ADMIN_API_TOKEN || ''
}

function getInviteType(plan: Registration['plan']): 'artist' | 'label' {
  return plan === 'label' ? 'label' : 'artist'
}

function sanitizeErrorMessage(value: unknown): string {
  if (!value) return 'Unknown invite sync error'
  if (typeof value === 'string') return value.slice(0, 300)
  if (value instanceof Error) return value.message.slice(0, 300)
  return JSON.stringify(value).slice(0, 300)
}

export async function syncInviteForRegistration({
  registrationId,
  email,
  plan,
  force = false,
}: SyncInviteParams): Promise<{ ok: boolean; message: string }> {
  const db = await getDatabase()
  const collection = db.collection<Registration>('registrations')
  const now = new Date().toISOString()

  const existing = await collection.findOne({ id: registrationId })
  if (!existing) {
    return { ok: false, message: 'Registration not found for invite sync' }
  }

  if (!force && existing.inviteSyncStatus === 'sent') {
    return { ok: true, message: 'Invite already synced' }
  }

  const token = getInviteToken()
  if (!token) {
    const message = 'ADMIN_API_TOKEN is not configured'
    await collection.updateOne(
      { id: registrationId },
      {
        $set: {
          inviteSyncStatus: 'failed' as InviteSyncStatus,
          inviteError: message,
          inviteLastAttemptAt: now,
          inviteSyncedAt: null,
          accountCreated: false,
        },
        $inc: { inviteAttempts: 1 },
      }
    )
    return { ok: false, message }
  }

  await collection.updateOne(
    { id: registrationId },
    {
      $set: {
        inviteSyncStatus: 'pending' as InviteSyncStatus,
        inviteLastAttemptAt: now,
        inviteError: null,
      },
      $inc: { inviteAttempts: 1 },
    }
  )

  const payload = {
    email: email.toLowerCase(),
    type: getInviteType(plan),
  }

  try {
    const response = await fetch(getInviteApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const rawBody = await response.text()
    const message = rawBody.slice(0, 300) || response.statusText
    const syncedAt = new Date().toISOString()

    if (!response.ok) {
      const errorMessage = `Invite API ${response.status}: ${message}`
      await collection.updateOne(
        { id: registrationId },
        {
          $set: {
            inviteSyncStatus: 'failed' as InviteSyncStatus,
            inviteError: errorMessage,
            inviteLastAttemptAt: syncedAt,
            inviteSyncedAt: null,
            accountCreated: false,
          },
        }
      )
      return { ok: false, message: errorMessage }
    }

    await collection.updateOne(
      { id: registrationId },
      {
        $set: {
          inviteSyncStatus: 'sent' as InviteSyncStatus,
          inviteError: null,
          inviteLastAttemptAt: syncedAt,
          inviteSyncedAt: syncedAt,
          accountCreated: true,
        },
      }
    )

    return { ok: true, message: 'Invite synced successfully' }
  } catch (error) {
    const errorMessage = sanitizeErrorMessage(error)
    await collection.updateOne(
      { id: registrationId },
      {
        $set: {
          inviteSyncStatus: 'failed' as InviteSyncStatus,
          inviteError: errorMessage,
          inviteLastAttemptAt: new Date().toISOString(),
          inviteSyncedAt: null,
          accountCreated: false,
        },
      }
    )
    return { ok: false, message: errorMessage }
  }
}
