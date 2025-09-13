import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/server/supabaseAdmin'
import { sendExpoPush } from '../../../../src/server/push'

export const runtime = 'edge'

function json(data: any, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('access-control-allow-origin', '*')
  headers.set('access-control-allow-methods', 'POST, GET, OPTIONS')
  headers.set('access-control-allow-headers', 'content-type, authorization, x-cron-secret')
  return new Response(JSON.stringify(data), { ...init, headers })
}

export async function OPTIONS() { return json({ ok: true }) }
export async function GET() { return json({ ok: true, status: 'ready' }) }

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret')
  if (!secret || secret !== (process.env.CRON_SECRET || '')) return json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const admin = getSupabaseAdmin()
    const now = new Date().toISOString()
    const { data, error } = await admin.from('scheduled_reminders').select('id, token, due_at, headline, body').is('sent_at', null).lte('due_at', now).limit(500)
    if (error) return json({ ok: false, error: error.message }, { status: 500 })
    if (!data || data.length === 0) return json({ ok: true, sent: 0 })
    const messages = data.map(r => ({ to: r.token, title: r.headline || 'Reading reminder', body: r.body || 'Open your saved reading and take the next step.' }))
    await sendExpoPush(messages)
    const ids = data.map(r => r.id)
    await admin.from('scheduled_reminders').update({ sent_at: new Date().toISOString() }).in('id', ids)
    return json({ ok: true, sent: ids.length })
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

