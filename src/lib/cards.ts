import { Element, MajorCardDef } from "../types";

export const SUIT_ELEMENT: Record<string, Element> = {
  Wands: "fire",
  Cups: "water",
  Swords: "air",
  Pentacles: "earth",
};

export const SUIT_KEYWORDS: Record<string, { upright: string[]; reversed: string[] }> = {
  Wands: {
    upright: ["action", "ambition", "creativity", "drive"],
    reversed: ["delay", "frustration", "scattered", "burnout"],
  },
  Cups: {
    upright: ["emotion", "relationships", "intuition", "flow"],
    reversed: ["block", "oversensitivity", "drain", "detachment"],
  },
  Swords: {
    upright: ["clarity", "truth", "analysis", "boundaries"],
    reversed: ["confusion", "harshness", "avoidance", "overthinking"],
  },
  Pentacles: {
    upright: ["work", "resources", "stability", "results"],
    reversed: ["scarcity", "misuse", "stagnation", "insecurity"],
  },
};

export const MAJORS: MajorCardDef[] = [
  {
    card: "The Fool",
    upright: ["new start", "spontaneity", "faith", "openness"],
    reversed: ["hesitation", "recklessness", "naivety", "risk blindness"],
    element: "air",
    numerology: 0,
  },
  {
    card: "The Magician",
    upright: ["will", "skill", "focus", "resourcefulness"],
    reversed: ["scattered", "manipulation", "untapped", "misfocus"],
    element: "air",
    numerology: 1,
  },
  {
    card: "The High Priestess",
    upright: ["intuition", "stillness", "mystery", "inner voice"],
    reversed: ["doubt", "secrets", "noise", "disconnection"],
    element: "water",
    numerology: 2,
  },
  {
    card: "The Empress",
    upright: ["nurture", "abundance", "creativity", "embodiment"],
    reversed: ["overgive", "block", "neglect", "stagnation"],
    element: "earth",
    numerology: 3,
  },
  {
    card: "The Emperor",
    upright: ["structure", "authority", "boundaries", "leadership"],
    reversed: ["rigidity", "control", "domineering", "instability"],
    element: "fire",
    numerology: 4,
  },
  {
    card: "The Hierophant",
    upright: ["tradition", "mentorship", "values", "conformity"],
    reversed: ["rebellion", "dogma", "box-breaking", "misalignment"],
    element: "earth",
    numerology: 5,
  },
  {
    card: "The Lovers",
    upright: ["choice", "union", "values", "alignment"],
    reversed: ["misalignment", "indecision", "disharmony", "temptation"],
    element: "air",
    numerology: 6,
  },
  {
    card: "The Chariot",
    upright: ["willpower", "focus", "victory", "alignment"],
    reversed: ["scattered", "stalling", "forcefulness", "misaligned"],
    element: "water",
    numerology: 7,
  },
  {
    card: "Strength",
    upright: ["courage", "patience", "inner power", "taming"],
    reversed: ["self-doubt", "impatience", "force", "fragility"],
    element: "fire",
    numerology: 8,
  },
  {
    card: "The Hermit",
    upright: ["solitude", "wisdom", "search", "inner light"],
    reversed: ["isolation", "avoidance", "stuck", "withdrawal"],
    element: "earth",
    numerology: 9,
  },
  {
    card: "Wheel of Fortune",
    upright: ["cycle", "turning point", "luck", "adapt"],
    reversed: ["resistance", "stall", "setback", "control issues"],
    element: "fire",
    numerology: 10,
  },
  {
    card: "Justice",
    upright: ["truth", "fairness", "cause/effect", "accountability"],
    reversed: ["bias", "avoidance", "injustice", "skewed data"],
    element: "air",
    numerology: 11,
  },
  {
    card: "The Hanged Man",
    upright: ["pause", "reframe", "surrender", "insight"],
    reversed: ["stall", "martyrdom", "delay", "stuck view"],
    element: "water",
    numerology: 12,
  },
  {
    card: "Death",
    upright: ["ending", "transformation", "release", "rebirth"],
    reversed: ["clinging", "fear", "slow change", "drag"],
    element: "water",
    numerology: 13,
  },
  {
    card: "Temperance",
    upright: ["balance", "blend", "patience", "moderation"],
    reversed: ["excess", "imbalance", "haste", "conflict"],
    element: "fire",
    numerology: 14,
  },
  {
    card: "The Devil",
    upright: ["bondage", "materialism", "temptation", "shadow"],
    reversed: ["release", "awareness", "detox", "reclaim"],
    element: "earth",
    numerology: 15,
  },
  {
    card: "The Tower",
    upright: ["upheaval", "revelation", "breakdown", "shock"],
    reversed: ["aftershock", "denial", "averted", "slow collapse"],
    element: "fire",
    numerology: 16,
  },
  {
    card: "The Star",
    upright: ["hope", "healing", "inspiration", "guidance"],
    reversed: ["doubt", "drain", "cynicism", "disconnection"],
    element: "air",
    numerology: 17,
  },
  {
    card: "The Moon",
    upright: ["intuition", "uncertainty", "dreams", "subconscious"],
    reversed: ["clarity", "fear", "anxiety", "revealed"],
    element: "water",
    numerology: 18,
  },
  {
    card: "The Sun",
    upright: ["vitality", "joy", "success", "clarity"],
    reversed: ["overexposure", "delayed", "ego", "dampened"],
    element: "fire",
    numerology: 19,
  },
  {
    card: "Judgement",
    upright: ["awakening", "reckoning", "calling", "renewal"],
    reversed: ["self-critique", "doubt", "avoid call", "stagnate"],
    element: "fire",
    numerology: 20,
  },
  {
    card: "The World",
    upright: ["completion", "integration", "wholeness", "arrival"],
    reversed: ["incomplete", "loose ends", "delay", "nearly there"],
    element: "earth",
    numerology: 21,
  },
];

export function majorsByName() {
  const map = new Map<string, MajorCardDef>();
  for (const m of MAJORS) map.set(m.card, m);
  return map;
}

export function cardElementFromName(name: string): Element | null {
  const majors = majorsByName();
  if (majors.has(name)) return majors.get(name)!.element;
  const ofIdx = name.indexOf(" of ");
  if (ofIdx !== -1) {
    const suit = name.slice(ofIdx + 4);
    return SUIT_ELEMENT[suit] ?? null;
  }
  return null;
}

export function getKeywordsForCard(name: string, reversed: boolean): string[] {
  const majors = majorsByName();
  if (majors.has(name)) {
    const def = majors.get(name)!;
    return reversed ? def.reversed : def.upright;
  }
  const ofIdx = name.indexOf(" of ");
  if (ofIdx !== -1) {
    const suit = name.slice(ofIdx + 4);
    const kw = SUIT_KEYWORDS[suit];
    if (kw) return reversed ? kw.reversed : kw.upright;
  }
  return [];
}

export function getInjectedCardDefs(drawnNames: string[]): MajorCardDef[] {
  const majors = majorsByName();
  const out: MajorCardDef[] = [];
  for (const n of drawnNames) {
    const def = majors.get(n);
    if (def) out.push(def);
  }
  return out;
}
