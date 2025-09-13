export default function PaywallPage() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={{ background: '#12141a', border: '1px solid #232530', borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Threads of Fate Pro</h2>
        <p style={{ opacity: 0.85 }}>Deeper spreads, exports, reminders, and sync. Buy on iOS/Android; web is read-only for purchases.</p>
      </section>

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <PricingCard
          name="Monthly"
          price="$X.99"
          period="per month"
          features={[
            'Deep spreads (10–12 cards)',
            'Export JSON + calendar (.ics)',
            'Server push reminders',
            'Cloud sync + reflections',
          ]}
        />
        <PricingCard
          name="Annual"
          price="$Y.99"
          period="per year"
          badge="Best value"
          features={[
            'Everything in Monthly',
            '2 months free',
            'Priority feature access',
          ]}
        />
      </section>

      <section style={{ background: '#12141a', border: '1px solid #232530', borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>How to purchase</h3>
        <ol>
          <li>Install the mobile app (iOS/Android).</li>
          <li>Open Paywall → choose Monthly or Annual.</li>
          <li>Sign in with the same email to sync entitlements on web.</li>
        </ol>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="#" style={{ color: '#9bb0ff', textDecoration: 'none' }}>App Store (iOS)</a>
          <a href="#" style={{ color: '#9bb0ff', textDecoration: 'none' }}>Google Play (Android)</a>
          <a href="/pro" style={{ color: '#9bb0ff', textDecoration: 'none' }}>Already Pro? Toggle dev mode</a>
        </div>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Purchases are processed by Apple/Google. Manage or cancel in your device account settings. Prices are placeholders until store setup.</p>
      </section>
    </div>
  );
}

function PricingCard({ name, price, period, features, badge }: { name: string; price: string; period: string; features: string[]; badge?: string }) {
  return (
    <div style={{ background: '#12141a', border: '1px solid #232530', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{name}</div>
        {badge && <span style={{ fontSize: 11, padding: '4px 6px', borderRadius: 999, background: '#18243a', border: '1px solid #2a3d6b' }}>{badge}</span>}
      </div>
      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>{price} <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>{period}</span></div>
      <ul style={{ marginTop: 12 }}>
        {features.map((f, i) => (
          <li key={i} style={{ opacity: 0.9 }}>{f}</li>
        ))}
      </ul>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <a href="#" style={{ color: '#9bb0ff', textDecoration: 'none' }}>Buy in mobile app</a>
      </div>
    </div>
  );
}

