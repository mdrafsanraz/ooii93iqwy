import { getDatabase } from './mongodb'
import type { Registration } from './registrations'

export type InviteSyncStatus = 'pending' | 'sent' | 'failed'

const DEFAULT_INVITE_API_URL = 'https://admin.rdistro.net/api/users/invite'
const DEFAULT_ADMIN_BASE_URL = 'https://admin.rdistro.net'

type SyncInviteParams = {
  registrationId: string
  email: string
  plan: Registration['plan']
  force?: boolean
}

function getInviteApiUrl(): string {
  return process.env.ADMIN_INVITE_API_URL || DEFAULT_INVITE_API_URL
}

function getAdminBaseUrl(): string {
  return process.env.ADMIN_BASE_URL || DEFAULT_ADMIN_BASE_URL
}

function getAdminLoginApiUrl(): string {
  return process.env.ADMIN_LOGIN_API_URL || `${getAdminBaseUrl()}/api/auth/login`
}

function getInviteToken(): string {
  return process.env.ADMIN_API_TOKEN || ''
}

function getAdminBotEmail(): string {
  return process.env.ADMIN_BOT_EMAIL || ''
}

function getAdminBotPassword(): string {
  return process.env.ADMIN_BOT_PASSWORD || ''
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

function isCloudflareHtmlChallenge(status: number, contentType: string | null, body: string): boolean {
  if (status !== 403) return false
  const bodyLower = body.toLowerCase()
  const contentTypeLower = (contentType || '').toLowerCase()
  return (
    contentTypeLower.includes('text/html') ||
    bodyLower.includes('cloudflare') ||
    bodyLower.includes('<!doctype html')
  )
}

async function syncInviteViaBrowser(payload: { email: string; type: 'artist' | 'label' }): Promise<{ ok: boolean; message: string }> {
  const botEmail = getAdminBotEmail()
  const botPassword = getAdminBotPassword()

  if (!botEmail || !botPassword) {
    return {
      ok: false,
      message: 'Browser fallback unavailable: ADMIN_BOT_EMAIL/ADMIN_BOT_PASSWORD missing',
    }
  }

  try {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(getAdminBaseUrl(), { waitUntil: 'domcontentloaded', timeout: 45000 })

    const result = await page.evaluate(
      async ({ loginApiUrl, inviteApiUrl, email, password, invitePayload }) => {
        const parseTokenFromJson = (data: unknown): string => {
          if (!data || typeof data !== 'object') return ''
          const asRecord = data as Record<string, unknown>
          const directToken = asRecord.token || asRecord.access_token || asRecord.jwt
          if (typeof directToken === 'string') return directToken
          const nested = asRecord.data as Record<string, unknown> | undefined
          if (nested) {
            const nestedToken = nested.token || nested.access_token || nested.jwt
            if (typeof nestedToken === 'string') return nestedToken
          }
          return ''
        }

        const loginRes = await fetch(loginApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const loginText = await loginRes.text()
        if (!loginRes.ok) {
          return {
            ok: false,
            message: `Browser login failed (${loginRes.status}): ${loginText.slice(0, 200)}`,
          }
        }

        let token = ''
        try {
          const parsed = JSON.parse(loginText)
          token = parseTokenFromJson(parsed)
        } catch {
          // Not JSON; continue trying headers/cookies
        }

        const authHeader = loginRes.headers.get('authorization') || loginRes.headers.get('Authorization')
        if (!token && authHeader?.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7).trim()
        }

        if (!token) {
          return {
            ok: false,
            message: 'Browser login succeeded but token not found in response',
          }
        }

        const inviteRes = await fetch(inviteApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(invitePayload),
        })

        const inviteText = await inviteRes.text()
        if (!inviteRes.ok) {
          return {
            ok: false,
            message: `Browser invite failed (${inviteRes.status}): ${inviteText.slice(0, 200)}`,
          }
        }

        return { ok: true, message: 'Invite synced successfully (browser fallback)' }
      },
      {
        loginApiUrl: getAdminLoginApiUrl(),
        inviteApiUrl: getInviteApiUrl(),
        email: botEmail,
        password: botPassword,
        invitePayload: payload,
      }
    )

    await browser.close()
    return result
  } catch (error) {
    return {
      ok: false,
      message: `Browser fallback error: ${sanitizeErrorMessage(error)}`,
    }
  }
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
    const token = getInviteToken()
    let directApiResult: { ok: boolean; message: string; cloudflareBlocked: boolean } = {
      ok: false,
      message: 'Direct API call skipped: ADMIN_API_TOKEN not configured',
      cloudflareBlocked: false,
    }

    if (token) {
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
      const cloudflareBlocked = isCloudflareHtmlChallenge(
        response.status,
        response.headers.get('content-type'),
        rawBody
      )

      directApiResult = {
        ok: response.ok,
        message: response.ok ? 'Invite synced successfully' : `Invite API ${response.status}: ${message}`,
        cloudflareBlocked,
      }
    }

    let finalResult = directApiResult
    if (!directApiResult.ok && (directApiResult.cloudflareBlocked || !token)) {
      const browserResult = await syncInviteViaBrowser(payload)
      if (browserResult.ok) {
        finalResult = browserResult
      } else {
        finalResult = {
          ok: false,
          message: `${directApiResult.message}. ${browserResult.message}`,
          cloudflareBlocked: directApiResult.cloudflareBlocked,
        }
      }
    }

    const syncedAt = new Date().toISOString()

    if (!finalResult.ok) {
      const errorMessage = finalResult.message
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

    return { ok: true, message: finalResult.message }
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
