"use client";
import { useEffect, useState } from "react";
import { getSessionUser, signInWithMagicLink, signOut } from "../../src/client/cloud";
import { supabase } from "../../src/client/supabase";
import { listCloudReadings } from "../../src/client/cloud";

function Card({ children, style = {} as any }: { children: any; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#12141a", border: "1px solid #232530", borderRadius: 12, padding: 16, ...style }}>{children}</div>
  );
}

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sent, setSent] = useState(false);
  const [cloudReadings, setCloudReadings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getSessionUser();
      setUser(u);
      if (u) {
        const list = await listCloudReadings(20);
        setCloudReadings(list);
      }
    })();
  }, []);

  async function onSignIn() {
    setError(null);
    try {
      await signInWithMagicLink(email);
      setSent(true);
    } catch (e: any) { setError(e?.message || String(e)); }
  }

  async function onSignOut() {
    await signOut();
    location.reload();
  }

  async function onDeleteAccount() {
    if (!confirm("Delete your account and all synced readings? This cannot be undone.")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not signed in');
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      await signOut();
      alert('Account deleted');
      location.href = '/';
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Account</div>
            <div style={{ opacity: 0.8 }}>Sign in to sync readings across devices.</div>
          </div>
          <a href="/" style={{ color: '#9bb0ff', textDecoration: 'none' }}>← Back</a>
        </div>
      </Card>
      {!user && (
        <Card>
          {sent ? (
            <div>Check your email for a magic link.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #2a2d3a', background: '#0f1116', color: '#e8e8ea' }} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={onSignIn} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>Send magic link</button>
                {error && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</span>}
              </div>
            </div>
          )}
        </Card>
      )}
      {user && (
        <>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div>User: {user.email || user.id}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Signed in</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onSignOut} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>Sign out</button>
                <button onClick={onDeleteAccount} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #3a1f23', background: '#1b0f11', color: '#ff9ba6' }}>Delete my account</button>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>Cloud readings</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {cloudReadings.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                  <div>
                    <div style={{ opacity: 0.85 }}>{r.output?.headline || '—'}</div>
                    <div style={{ opacity: 0.6 }}>{new Date(r.timestamp_iso).toLocaleString()}</div>
                  </div>
                  <div style={{ opacity: 0.7 }}>{r.input?.intent} • {r.input?.spread?.name}</div>
                </div>
              ))}
              {cloudReadings.length === 0 && <div style={{ opacity: 0.7 }}>No cloud readings yet.</div>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
