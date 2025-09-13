import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/server/supabaseAdmin'

export const runtime = 'edge'

function json(data: any, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('access-control-allow-origin', '*')
  headers.set('access-control-allow-methods', 'POST, OPTIONS')
  headers.set('access-control-allow-headers', 'content-type, authorization')
  return new Response(JSON.stringify(data), { ...init, headers })
}

export async function OPTIONS() { return json({ ok: true }) }

export async function POST(req: NextRequest) {
  try {
    const { token, device_id, user_id } = await req.json()
    if (!token || typeof token !== 'string') return json({ ok: false, error: 'Missing token' }, { status: 400 })
    const admin = getSupabaseAdmin()
    const { error } = await admin.from('push_tokens').upsert({ token, device_id: device_id || null, user_id: user_id || null })
    if (error) return json({ ok: false, error: error.message }, { status: 500 })
    return json({ ok: true })
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

