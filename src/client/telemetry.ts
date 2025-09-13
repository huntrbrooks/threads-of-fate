export type TelemetryEvent = {
  type: 'wizard_start' | 'wizard_complete' | 'reading_success' | 'reading_error';
  meta?: Record<string, any>;
};

export async function sendTelemetry(ev: TelemetryEvent) {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ev),
      keepalive: true,
    });
  } catch {}
}

