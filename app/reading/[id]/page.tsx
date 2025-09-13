"use client";
import { useEffect, useMemo, useState } from "react";
import { getReading, listSaved, updateReading, deleteReading, type SavedReading } from "../../../src/client/storage";
import { canUse } from "../../../src/client/features";
import { createICS, requestNotificationPermission, startReminderWatcher } from "../../../src/client/reminders";
import { CardThumb } from "../../../src/ui/CardThumb";
import { KeywordsBadge } from "../../../src/ui/Keywords";

function Card({ children, style = {} as any }: { children: any; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#12141a", border: "1px solid #232530", borderRadius: 12, padding: 16, ...style }}>{children}</div>
  );
}

function SectionTitle({ children }: { children: any }) {
  return <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>{children}</div>;
}

export default function ReadingDetail({ params }: { params: { id: string } }) {
  const [reading, setReading] = useState<SavedReading | null>(null);
  const [icsHref, setIcsHref] = useState<string | null>(null);
  const [jsonHref, setJsonHref] = useState<string | null>(null);

  useEffect(() => {
    startReminderWatcher();
    const r = getReading(params.id);
    setReading(r || null);
  }, [params.id]);

  const positions = useMemo(() => reading?.output?.position_readings || [], [reading]);

  function downloadICS() {
    if (!reading || !reading.reminderAt) return;
    const ics = createICS(reading, reading.reminderAt);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    setIcsHref(url);
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = url; a.download = `reading-${reading.id}.ics`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 0);
  }

  function downloadJSON() {
    if (!reading) return;
    const blob = new Blob([JSON.stringify(reading, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setJsonHref(url);
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = url; a.download = `reading-${reading.id}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 0);
  }

  async function enableNotifications() {
    await requestNotificationPermission();
    startReminderWatcher();
  }

  if (!reading) return <Card><div>Reading not found.</div></Card>;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{reading.output?.headline}</div>
            <div style={{ opacity: 0.85 }}>{reading.output?.summary}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/" style={{ color: '#9bb0ff', textDecoration: 'none' }}>← Back</a>
            <button onClick={() => { deleteReading(reading.id); location.href = '/'; }} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#1b0f11', color: '#ff9ba6' }}>Delete</button>
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle>Spread — {reading.input?.spread?.name}</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {positions.map((p: any, idx: number) => (
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
      </Card>
      <Card>
        <SectionTitle>Actions</SectionTitle>
        <ol>
          {reading.output?.actions?.map((a: any, i: number) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>{a.step}</span> — <span style={{ opacity: 0.9 }}>{a.why}</span> <span style={{ opacity: 0.7 }}>(within {a.within})</span>
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={enableNotifications} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>Enable notifications</button>
          {reading.reminderAt && (
            <>
              {canUse('calendar_export') ? (
                <button onClick={downloadICS} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>Download calendar reminder (.ics)</button>
              ) : (
                <a href="/pro" style={{ color: '#9bb0ff', textDecoration: 'none', alignSelf: 'center' }}>Calendar export is Pro</a>
              )}
              <div style={{ fontSize: 12, opacity: 0.7, alignSelf: 'center' }}>Reminder at: {new Date(reading.reminderAt).toLocaleString()}</div>
            </>
          )}
          {canUse('export_json') ? (
            <button onClick={downloadJSON} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #2a2d3a', background: '#12141a', color: '#e8e8ea' }}>Export JSON</button>
          ) : (
            <a href="/pro" style={{ color: '#9bb0ff', textDecoration: 'none', alignSelf: 'center' }}>Export JSON is Pro</a>
          )}
        </div>
      </Card>
    </div>
  );
}
