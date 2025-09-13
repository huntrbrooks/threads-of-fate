"use client";
import { getPro, setPro } from "../../src/client/features";

export default function ProPage() {
  const isPro = typeof window !== 'undefined' ? getPro() : false;
  function togglePro() {
    setPro(!isPro);
    location.reload();
  }
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ background: '#12141a', border: '1px solid #232530', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Go Pro</div>
        <div style={{ opacity: 0.85, marginBottom: 12 }}>
          Unlock deep spreads, calendar exports, JSON exports, and server-scheduled reminders.
        </div>
        <ul>
          <li>Deep spreads (10–12 cards)</li>
          <li>Export reading as JSON</li>
          <li>Calendar (.ics) action reminders</li>
          <li>Server push notifications (mobile)</li>
        </ul>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <a href="/" style={{ color: '#9bb0ff', textDecoration: 'none' }}>← Back</a>
          <button onClick={togglePro} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>{isPro ? 'Disable Pro (dev)' : 'Unlock Pro (dev)'}</button>
          <a href="/paywall" style={{ color: '#9bb0ff', textDecoration: 'none', alignSelf: 'center' }}>See plans</a>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          Note: Web uses a development switch. Native apps must use in‑app purchases (StoreKit/Play Billing) or a provider like RevenueCat.
        </div>
      </div>
    </div>
  );
}
