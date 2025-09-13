import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceKey || !url) return json({ ok: false, error: 'Server not configured' }, { status: 500 })
    const auth = req.headers.get('authorization') || ''
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null
    if (!token) return json({ ok: false, error: 'Missing bearer token' }, { status: 401 })

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: userData, error: getUserErr } = await admin.auth.getUser(token)
    if (getUserErr || !userData?.user) return json({ ok: false, error: 'Invalid token' }, { status: 401 })

    const userId = userData.user.id
    // Delete rows first (optional due to cascade)
    await admin.from('readings').delete().eq('user_id', userId)
    // Delete auth user
    const { error: delErr } = await admin.auth.admin.deleteUser(userId)
    if (delErr) return json({ ok: false, error: delErr.message }, { status: 500 })
    return json({ ok: true })
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

