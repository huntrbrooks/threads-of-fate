import { supabase } from './supabase'
import type { SavedReading } from './storage'

export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined } })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSessionUser() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session?.user || null
}

export async function upsertReadingCloud(r: SavedReading) {
  const user = await getSessionUser()
  if (!user) throw new Error('Not signed in')
  const { error } = await supabase.from('readings').upsert({
    id: r.id,
    user_id: user.id,
    timestamp_iso: r.timestamp_iso,
    input: r.input,
    output: r.output,
    seed: String(r.seed),
    reflection: r.reflection || null,
    reminder_at: r.reminderAt || null,
  })
  if (error) throw error
}

export async function listCloudReadings(limit = 20) {
  const user = await getSessionUser()
  if (!user) return []
  const { data, error } = await supabase.from('readings').select('*').eq('user_id', user.id).order('timestamp_iso', { ascending: false }).limit(limit)
  if (error) throw error
  return data || []
}

export async function deleteCloudReading(id: string) {
  const user = await getSessionUser()
  if (!user) throw new Error('Not signed in')
  const { error } = await supabase.from('readings').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw error
}

