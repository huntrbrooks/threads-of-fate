"use client";
import { getPro, setPro } from "../client/features";

export function PaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const isPro = typeof window !== 'undefined' ? getPro() : false;
  function unlock() { setPro(true); onClose(); }
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
      <div style={{ width: 480, maxWidth: '92%', background: '#0f1116', border: '1px solid #2a2d3a', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Go Pro</div>
          <button onClick={onClose} style={{ background: 'transparent', color: '#e8e8ea', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ opacity: 0.85, marginBottom: 12 }}>Unlock deeper spreads and premium features. Purchases are available in the mobile app; use this toggle for web development.</div>
        <ul style={{ marginLeft: 18 }}>
          <li>Deep spreads (10–12 cards)</li>
          <li>Export reading as JSON</li>
          <li>Calendar (.ics) reminders</li>
          <li>Server push notifications (mobile)</li>
        </ul>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={unlock} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>{isPro ? 'Pro enabled' : 'Unlock Pro (dev)'}</button>
          <a href="/apps/mobile" style={{ color: '#9bb0ff', textDecoration: 'none', alignSelf: 'center' }}>Buy in mobile app</a>
        </div>
      </div>
    </div>
  );
}

