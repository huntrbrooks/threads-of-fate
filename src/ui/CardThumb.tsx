"use client";
import { cardElementFromName } from "../lib/cards";
import { IconWands, IconCups, IconSwords, IconPentacles } from "./icons/Suits";
import { IconMagician, IconChariot, IconHermit, IconTower } from "./icons/Majors";

export function CardThumb({ name, reversed }: { name: string; reversed: boolean }) {
  const el = cardElementFromName(name) || "air";
  const { bg, fg } = palette(el);
  const Icon = svgFor(name);
  return (
    <div title={name + (reversed ? " (reversed)" : "")} style={{
      width: 46,
      height: 64,
      borderRadius: 8,
      border: `1px solid ${fg}33`,
      background: `linear-gradient(135deg, ${bg} 0%, #0b0c0f 100%)`,
      color: fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      transform: reversed ? 'rotate(180deg)' : 'none',
      userSelect: 'none'
    }}>
      {Icon ? <Icon /> : <span style={{ fontSize: 16 }}>{symbolFallback(name)}</span>}
    </div>
  );
}

function palette(el: string) {
  switch (el) {
    case 'fire': return { bg: '#2b1a13', fg: '#ffb28b' };
    case 'water': return { bg: '#14202b', fg: '#9bc7ff' };
    case 'earth': return { bg: '#161f16', fg: '#b8d492' };
    default: return { bg: '#181a22', fg: '#cfd4ff' }; // air
  }
}

function svgFor(name: string): React.ComponentType<any> | null {
  // Majors (selected)
  switch (name) {
    case 'The Magician': return IconMagician;
    case 'The Chariot': return IconChariot;
    case 'The Hermit': return IconHermit;
    case 'The Tower': return IconTower;
  }
  // Suits
  if (name.includes(' of ')) {
    const suit = name.split(' of ')[1];
    if (suit === 'Wands') return IconWands;
    if (suit === 'Cups') return IconCups;
    if (suit === 'Swords') return IconSwords;
    if (suit === 'Pentacles') return IconPentacles;
  }
  return null;
}

function symbolFallback(name: string) {
  if (!name.includes(' of ')) return '★';
  const suit = name.split(' of ')[1];
  return suit?.[0] || '?';
}
