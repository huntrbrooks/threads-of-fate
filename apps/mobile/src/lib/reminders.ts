import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

async function getExpoPushToken(): Promise<string | null> {
  try {
    const resp = await Notifications.getExpoPushTokenAsync({ projectId: (Constants?.expoConfig?.extra as any)?.eas?.projectId || (Constants?.expoConfig as any)?.extra?.eas?.projectId })
    return resp.data
  } catch {
    return null
  }
}

async function api(path: string, body: any) {
  const base = (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_API_BASE || process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'
  const res = await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Push API error')
  return data
}

export async function requestPermissions() {
  const settings = await Notifications.getPermissionsAsync()
  if (settings.granted) return true
  const ask = await Notifications.requestPermissionsAsync()
  return ask.granted
}

export async function scheduleReminder(daysFromNow: number) {
  const due = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
  try {
    const token = await getExpoPushToken()
    if (token) {
      await api('/api/push/register', { token })
      await api('/api/push/schedule', { token, due_at_iso: due.toISOString(), headline: 'Reading reminder', body: 'Open your saved reading and take the next step.' })
    } else {
      // fallback to local scheduling
      await Notifications.scheduleNotificationAsync({ content: { title: 'Reading reminder', body: 'Open your saved reading and take the next step.' }, trigger: due })
    }
  } catch {}
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false })
})
