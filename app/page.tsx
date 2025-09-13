"use client";
import { useEffect, useMemo, useState } from "react";
import { postReading } from "../src/client/api";
import { getOrCreateUserId, saveReading, updateReading, listSaved, getPrivateMode, setPrivateMode } from "../src/client/storage";
import { sendTelemetry } from "../src/client/telemetry";
import { requestNotificationPermission, startReminderWatcher } from "../src/client/reminders";
import { getSessionUser, upsertReadingCloud } from "../src/client/cloud";
import { CardThumb } from "../src/ui/CardThumb";
import { KeywordsBadge } from "../src/ui/Keywords";
import { PaywallModal } from "../src/ui/PaywallModal";
import { canUse, getPro } from "../src/client/features";
import { canUse, getPro } from "../src/client/features";

type Intent = "decision_clarity" | "relationship_dynamics" | "career_money" | "health_energy" | "personal_growth" | "open_reading";
type Timeframe = "7d" | "30d" | "90d" | "6m" | "1y";
type Voice = "straight_talker" | "gentle_coach" | "mystical_poetic" | "practical_strategist";
type Depth = "quick" | "standard" | "deep";
type Spirituality = "none" | "light" | "rich";

const INTENTS: { id: Intent; label: string }[] = [
  { id: "decision_clarity", label: "Clarity on a decision" },
  { id: "relationship_dynamics", label: "Understand relationship dynamics" },
  { id: "career_money", label: "Career shift or money" },
  { id: "health_energy", label: "Health and energy" },
  { id: "personal_growth", label: "Personal growth" },
  { id: "open_reading", label: "Open reading" },
];

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: "7d", label: "Next 7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "6m", label: "6 months" },
  { id: "1y", label: "1 year" },
];

const VOICES: { id: Voice; label: string }[] = [
  { id: "straight_talker", label: "Straight talker" },
  { id: "gentle_coach", label: "Gentle coach" },
  { id: "mystical_poetic", label: "Mystical poetic" },
  { id: "practical_strategist", label: "Practical strategist" },
];

const DEPTHS: { id: Depth; label: string }[] = [
  { id: "quick", label: "Quick (3 cards)" },
  { id: "standard", label: "Standard (6–8)" },
  { id: "deep", label: "Deep (10–12)" },
];

const SPIRIT: { id: Spirituality; label: string }[] = [
  { id: "none", label: "None" },
  { id: "light", label: "Light" },
  { id: "rich", label: "Rich" },
];

function Card({ children, style = {} as any }: { children: any; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#12141a", border: "1px solid #232530", borderRadius: 12, padding: 16, ...style }}>{children}</div>
  );
}

function SectionTitle({ children }: { children: any }) {
  return <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>{children}</div>;
}

function Button({ children, onClick, disabled }: { children: any; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #2a2d3a",
      background: disabled ? "#1a1c24" : "#1d2030",
      color: disabled ? "#777" : "#e8e8ea",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 14,
    }}>{children}</button>
  );
}

export default function HomePage() {
  const uid = useMemo(() => getOrCreateUserId(), []);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [focus, setFocus] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe | null>(null);
  const [noTopics, setNoTopics] = useState("");
  const [excludePeople, setExcludePeople] = useState("");
  const [relationship, setRelationship] = useState("n/a");
  const [work, setWork] = useState("n/a");
  const [tone, setTone] = useState(3); // 1..5
  const [voice, setVoice] = useState<Voice>("straight_talker");
  const [depth, setDepth] = useState<Depth>("standard");
  const [spirituality, setSpirituality] = useState<Spirituality>("light");
  const [consent, setConsent] = useState(false);
  const pro = typeof window !== 'undefined' ? getPro() : false;
  const [privateMode, setPrivate] = useState<boolean>(typeof window !== 'undefined' ? getPrivateMode() : false);
  const [allowReversals, setAllowReversals] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [savingCloud, setSavingCloud] = useState(false);
  const [reflection, setReflection] = useState("");
  const [remindIn, setRemindIn] = useState<"7d" | "30d" | "90d">("30d");
  const [showPaywall, setShowPaywall] = useState(false);

  const canNext1 = !!intent && focus.trim().length >= 8 && focus.trim().length <= 200 && !!timeframe;
  const canDraw = canNext1 && consent;

  async function onDraw() {
    if (!intent || !timeframe) return;
    if (depth === 'deep' && !canUse('deep_spreads')) { location.href = '/pro'; return; }
    setLoading(true); setError(null); setResult(null);
    const seed = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const prepare = {
      user_id: uid,
      session_id: sessionId,
      timestamp_iso: nowIso,
      intent,
      focus_prompt: focus.trim(),
      timeframe,
      constraints: {
        no_topics: noTopics ? noTopics.split(",").map(s => s.trim()).filter(Boolean) : [],
        exclude_people: excludePeople ? excludePeople.split(",").map(s => s.trim()).filter(Boolean) : [],
      },
      context: { relationship_status: relationship, work_status: work, emotion_tone: tone },
      style: { voice, depth, spirituality },
      depth,
      deck: "RWS",
      seed,
      allowReversals,
    };
    try {
      const data = await postReading({ mode: "run", prepare });
      setResult(data);
      saveReading({ id: sessionId, timestamp_iso: nowIso, input: data.input, output: data.output, seed });
      setStep(4);
      sendTelemetry({ type: 'reading_success', meta: { intent, depth, timeframe } });
    } catch (e: any) {
      setError(e?.message || String(e));
      sendTelemetry({ type: 'reading_error', meta: { message: e?.message || String(e) } });
    } finally {
      setLoading(false);
    }
  }

  function SaveReflection() {
    if (!result?.input?.session_id) return;
    updateReading(result.input.session_id, { reflection });
  }

  function SaveReminder() {
    if (!result?.input?.session_id) return;
    const base = new Date(result.input.timestamp_iso).getTime();
    const delta = remindIn === "7d" ? 7 : remindIn === "30d" ? 30 : 90;
    const at = new Date(base + delta * 86400000).toISOString();
    updateReading(result.input.session_id, { reminderAt: at });
  }

  const saved = listSaved();
  useEffect(() => { startReminderWatcher(); }, []);
  useEffect(() => { (async () => setUser(await getSessionUser()))(); }, []);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>Guided onboarding → seeded draw → actionable reading.</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>User: {uid.slice(0, 8)}…</div>
        </div>
      </Card>

      {step === 1 && (
        <Card>
          <SectionTitle>Step 1 — Intent, Focus, Timeframe</SectionTitle>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>Pick one so I can aim the reading.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INTENTS.map((i) => (
                  <button key={i.id} onClick={() => setIntent(i.id)} style={{ padding: '8px 10px', borderRadius: 10, border: intent === i.id ? '1px solid #6b8cff' : '1px solid #2a2d3a', background: intent === i.id ? '#1c2238' : '#12141a', color: '#e8e8ea' }}>{i.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>One sentence. What is the real question under your question.</div>
              <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g., Should I accept the startup offer?" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #2a2d3a', background: '#0f1116', color: '#e8e8ea' }} />
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{focus.length}/200</div>
            </div>
            <div>
              <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>Pick the window you care about. I will read for that.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TIMEFRAMES.map((t) => (
                  <button key={t.id} onClick={() => setTimeframe(t.id)} style={{ padding: '8px 10px', borderRadius: 10, border: timeframe === t.id ? '1px solid #6b8cff' : '1px solid #2a2d3a', background: timeframe === t.id ? '#1c2238' : '#12141a', color: '#e8e8ea' }}>{t.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => { setStep(2); sendTelemetry({ type: 'wizard_start', meta: { intent } }); }} disabled={!canNext1}>Next</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <SectionTitle>Step 2 — Constraints & Context</SectionTitle>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>Anything off limits. I will respect it.</div>
              <input value={noTopics} onChange={(e) => setNoTopics(e.target.value)} placeholder="Things I do not want advice on (comma separated)" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #2a2d3a', background: '#0f1116', color: '#e8e8ea' }} />
            </div>
            <div>
              <input value={excludePeople} onChange={(e) => setExcludePeople(e.target.value)} placeholder="People I prefer not to include (comma separated)" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #2a2d3a', background: '#0f1116', color: '#e8e8ea' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>Relationship status</div>
                <select value={relationship} onChange={(e) => setRelationship(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #2a2d3a', background: '#0f1116', color: '#e8e8ea' }}>
                  <option>single</option>
                  <option>partnered</option>
                  <option>n/a</option>
                </select>
              </div>
              <div>
                <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>Work status</div>
                <select value={work} onChange={(e) => setWork(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #2a2d3a', background: '#0f1116', color: '#e8e8ea' }}>
                  <option>employed</option>
                  <option>freelance</option>
                  <option>founder</option>
                  <option>searching</option>
                  <option>n/a</option>
                </select>
              </div>
              <div>
                <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>Emotional tone</div>
                <input type="range" min={1} max={5} value={tone} onChange={(e) => setTone(parseInt(e.target.value))} style={{ width: '100%' }} />
                <div style={{ fontSize: 12, opacity: 0.7 }}>1 calm → 5 overwhelmed: {tone}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <SectionTitle>Step 3 — Style & Consent</SectionTitle>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>How blunt or mystical do you want me.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {VOICES.map(v => (
                  <button key={v.id} onClick={() => setVoice(v.id)} style={{ padding: '8px 10px', borderRadius: 10, border: voice === v.id ? '1px solid #6b8cff' : '1px solid #2a2d3a', background: voice === v.id ? '#1c2238' : '#12141a', color: '#e8e8ea' }}>{v.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 6, fontSize: 13, opacity: 0.8 }}>Depth & Spirituality</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DEPTHS.map(d => {
                  const isProOnly = d.id === 'deep';
                  const locked = isProOnly && !pro;
                  return (
                    <button key={d.id} onClick={() => locked ? setShowPaywall(true) : setDepth(d.id)}
                      title={isProOnly ? (pro ? 'Pro unlocked' : 'Pro required') : ''}
                      style={{ padding: '8px 10px', borderRadius: 10, border: depth === d.id ? '1px solid #6b8cff' : '1px solid #2a2d3a', background: depth === d.id ? '#1c2238' : '#12141a', color: locked ? '#888' : '#e8e8ea' }}>
                      {d.label}{isProOnly ? ' (Pro)' : ''}
                    </button>
                  );
                })}
                {SPIRIT.map(s => (
                  <button key={s.id} onClick={() => setSpirituality(s.id)} style={{ padding: '8px 10px', borderRadius: 10, border: spirituality === s.id ? '1px solid #6b8cff' : '1px solid #2a2d3a', background: spirituality === s.id ? '#1c2238' : '#12141a', color: '#e8e8ea' }}>{s.label} spiritual</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="checkbox" id="rev" checked={allowReversals} onChange={(e) => setAllowReversals(e.target.checked)} />
              <label htmlFor="rev" style={{ opacity: 0.85 }}>Include reversals</label>
              <span style={{ width: 16 }} />
              <input type="checkbox" id="priv" checked={privateMode} onChange={(e) => { setPrivate(e.target.checked); setPrivateMode(e.target.checked); }} />
              <label htmlFor="priv" style={{ opacity: 0.85 }}>Private mode (do not sync)</label>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <label htmlFor="consent" style={{ opacity: 0.85 }}>
                I understand this is guidance, not legal or medical advice.
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
              <Button onClick={() => setStep(2)}>Back</Button>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {error && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</span>}
                <Button onClick={onDraw} disabled={!canDraw || loading}>{loading ? 'Drawing…' : 'Draw'}</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && result?.output && (
        <Card>
          <SectionTitle>Reading</SectionTitle>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{result.output.headline}</div>
            <div style={{ opacity: 0.85 }}>{result.output.summary}</div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Spread: {result.input.spread.name} — {result.input.spread.positions.length} positions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {result.output.position_readings.map((p: any, idx: number) => (
                  <div key={idx} style={{ border: '1px solid #2a2d3a', borderRadius: 10, padding: 12, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center' }}>
                    <CardThumb name={p.card} reversed={p.reversed} />
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{p.position}</div>
                      <div style={{ fontWeight: 600 }}>{p.card}{p.reversed ? ' (reversed)' : ''}</div>
                      <div style={{ opacity: 0.9, marginTop: 6 }}>{p.meaning}</div>
                    </div>
                    <KeywordsBadge card={p.card} reversed={p.reversed} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Patterns</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(result.output.patterns || []).map((pat: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, padding: '6px 8px', borderRadius: 999, background: '#171a24', border: '1px solid #2a2d3a' }}>{pat}</span>
                ))}
                {/* reader_notes badges */}
                <span style={{ fontSize: 12, padding: '6px 8px', borderRadius: 999, background: '#171a24', border: '1px solid #2a2d3a' }}>{result.input.reader_notes.majors_count} Majors</span>
                <span style={{ fontSize: 12, padding: '6px 8px', borderRadius: 999, background: '#171a24', border: '1px solid #2a2d3a' }}>Reversals: {result.input.reader_notes.reversals_count}</span>
              </div>
            </div>
            {result.output.decision_frame && (
              <div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Decision frame</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{result.output.decision_frame.options?.[0] || 'A'}</div>
                    <ul>
                      {(result.output.decision_frame.pros_cons?.[result.output.decision_frame.options?.[0] || 'A'] || []).map((s: string, i: number) => (
                        <li key={i} style={{ opacity: 0.9 }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{result.output.decision_frame.options?.[1] || 'B'}</div>
                    <ul>
                      {(result.output.decision_frame.pros_cons?.[result.output.decision_frame.options?.[1] || 'B'] || []).map((s: string, i: number) => (
                        <li key={i} style={{ opacity: 0.9 }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  Likely path: {result.output.decision_frame.likely_path}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Actions</div>
              <ol>
                {result.output.actions.map((a: any, i: number) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{a.step}</span> — <span style={{ opacity: 0.9 }}>{a.why}</span> <span style={{ opacity: 0.7 }}>(within {a.within})</span>
                  </li>
                ))}
              </ol>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={SaveReflection}>Save plan</Button>
                <select value={remindIn} onChange={(e) => setRemindIn(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>
                  <option value="7d">Remind in 7 days</option>
                  <option value="30d">Remind in 30 days</option>
                  <option value="90d">Remind in 90 days</option>
                </select>
                <Button onClick={SaveReminder}>Set reminder</Button>
                <button onClick={() => requestNotificationPermission()} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>Enable notifications</button>
                {user && !privateMode && (
                  <button disabled={savingCloud} onClick={async () => {
                    if (!result?.input?.session_id) return;
                    setSavingCloud(true);
                    try {
                      const local = saved.find(s => s.id === result.input.session_id);
                      await upsertReadingCloud({ id: result.input.session_id, timestamp_iso: result.input.timestamp_iso, input: result.input, output: result.output, seed: local?.seed || 'n/a', reflection: local?.reflection, reminderAt: local?.reminderAt });
                      alert('Saved to cloud');
                    } catch (e: any) {
                      alert('Cloud save failed: ' + (e?.message || String(e)));
                    } finally { setSavingCloud(false); }
                  }} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>{savingCloud ? 'Saving…' : 'Save to cloud'}</button>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Affirmation</div>
              <div style={{ opacity: 0.9 }}>{result.output.affirmation}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Cautions</div>
              <ul>
                {result.output.cautions.map((c: string, i: number) => (
                  <li key={i} style={{ opacity: 0.9 }}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Reality check — What line hit hardest?</div>
              <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Write one line and save."
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #2a2d3a', background: '#0f1116', color: '#e8e8ea', minHeight: 80 }} />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle>Recent readings (local)</SectionTitle>
        <div style={{ display: 'grid', gap: 8 }}>
          {saved.map((s) => (
            <a key={s.id} href={`/reading/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                <div>
                  <div style={{ opacity: 0.85 }}>{s.output?.headline || '—'}</div>
                  <div style={{ opacity: 0.6 }}>{new Date(s.timestamp_iso).toLocaleString()}</div>
                </div>
                <div style={{ opacity: 0.7 }}>{s.input?.intent} • {s.input?.spread?.name}</div>
              </div>
            </a>
          ))}
          {saved.length === 0 && <div style={{ opacity: 0.7 }}>No saved readings yet.</div>}
        </div>
      </Card>
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
