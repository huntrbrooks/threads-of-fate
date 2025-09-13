export type PushMessage = { to: string; title?: string; body?: string; data?: any };

export async function sendExpoPush(messages: PushMessage[]) {
  const chunks: PushMessage[][] = []
  const size = 90
  for (let i = 0; i < messages.length; i += size) chunks.push(messages.slice(i, i + size))
  const receipts: any[] = []
  for (const chunk of chunks) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(chunk)
    })
    const data = await res.json().catch(() => ({}))
    receipts.push(data)
  }
  return receipts
}

