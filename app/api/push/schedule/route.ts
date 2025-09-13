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
    const { token, due_at_iso, headline, body } = await req.json()
    if (!token || !due_at_iso) return json({ ok: false, error: 'Missing token or due_at_iso' }, { status: 400 })
    const due = new Date(due_at_iso)
    if (isNaN(due.getTime())) return json({ ok: false, error: 'Invalid due_at_iso' }, { status: 400 })
    const admin = getSupabaseAdmin()
    // Ensure token exists
    await admin.from('push_tokens').upsert({ token })
    const { error } = await admin.from('scheduled_reminders').insert({ token, due_at: due.toISOString(), headline: headline || null, body: body || null })
    if (error) return json({ ok: false, error: error.message }, { status: 500 })
    return json({ ok: true })
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

