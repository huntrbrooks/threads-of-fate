"use client";
import { useState } from "react";
import { getKeywordsForCard } from "../lib/cards";

export function KeywordsBadge({ card, reversed }: { card: string; reversed: boolean }) {
  const [open, setOpen] = useState(false);
  const kws = getKeywordsForCard(card, reversed);
  if (!kws.length) return null;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, background: '#171a24', border: '1px solid #2a2d3a', cursor: 'default' }}>Keywords</span>
      {open && (
        <div style={{ position: 'absolute', top: '120%', left: 0, zIndex: 30, background: '#0f1116', border: '1px solid #2a2d3a', borderRadius: 8, padding: 8, width: 220, boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>{card}{reversed ? ' (reversed)' : ''}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {kws.map((k, i) => (
              <span key={i} style={{ fontSize: 12, padding: '4px 6px', borderRadius: 999, background: '#141720', border: '1px solid #2a2d3a' }}>{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

