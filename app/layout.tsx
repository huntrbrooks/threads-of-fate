export const metadata = {
  title: "Threads of Fate",
  description: "Actionable Tarot readings with clarity and consent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif', background: '#0b0c0f', color: '#e8e8ea', margin: 0 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h1 style={{ fontSize: 20, margin: 0 }}>Threads of Fate</h1>
            <nav style={{ opacity: 0.8, fontSize: 13, display: 'flex', gap: 12 }}>
              <a href="/paywall" style={{ color: '#9bb0ff', textDecoration: 'none' }}>Go Pro</a>
              <a href="/account" style={{ color: '#9bb0ff', textDecoration: 'none' }}>Account</a>
              <a href="/privacy" style={{ color: '#9bb0ff', textDecoration: 'none' }}>Privacy</a>
              <a href="/terms" style={{ color: '#9bb0ff', textDecoration: 'none' }}>Terms</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
