import Constants from 'expo-constants'

const API_BASE: string = (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_API_BASE || process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'

export async function drawReading(prepare: any) {
  const res = await fetch(`${API_BASE}/api/reading`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'run', prepare })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Reading failed')
  return data
}

