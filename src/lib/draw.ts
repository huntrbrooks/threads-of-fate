import { CardDrawn, DeckDrawResult, ReaderNotes } from "../types";
import { cardElementFromName } from "./cards";

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function rngFromSeed(seed: string | number) {
  const s = typeof seed === "number" ? String(seed) : seed;
  const seedGen = xmur3(s);
  return sfc32(seedGen(), seedGen(), seedGen(), seedGen());
}

function buildRWSDeck(): string[] {
  const majors = [
    "The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"
  ];
  const suits = ["Wands", "Cups", "Swords", "Pentacles"];
  const ranks = [
    "Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"
  ];
  const minors: string[] = [];
  for (const suit of suits) {
    for (const rank of ranks) minors.push(`${rank} of ${suit}`);
  }
  return [...majors, ...minors];
}

export function listDeck(deck: string = "RWS"): string[] {
  if (deck === "RWS" || deck === "MinimalGlyphsV1") return buildRWSDeck();
  return buildRWSDeck();
}

function shuffleInPlace<T>(arr: T[], rand: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function drawCards(args: {
  seed: string | number;
  deck?: string;
  positions: number;
  allowReversals?: boolean;
}): DeckDrawResult {
  const { seed, deck = "RWS", positions, allowReversals = true } = args;
  const rand = rngFromSeed(seed);
  const deckList = listDeck(deck).slice();
  shuffleInPlace(deckList, rand);
  const picks = deckList.slice(0, positions);

  const cards: CardDrawn[] = picks.map((name, idx) => ({
    name,
    reversed: allowReversals ? rand() < 0.5 : false,
    position: idx + 1,
  }));

  const notes = computeReaderNotes(cards);
  return { cards, notes };
}

export function computeReaderNotes(cards: CardDrawn[]): ReaderNotes {
  let majors_count = 0;
  let reversals_count = 0;
  const element_bias = { fire: 0, water: 0, air: 0, earth: 0 };
  const numerology: Record<string, number> = { aces: 0, fives: 0, sevens: 0 };

  for (const c of cards) {
    if (!c.name.includes(" of ")) majors_count++;
    if (c.reversed) reversals_count++;
    const el = cardElementFromName(c.name);
    if (el) element_bias[el]++;
    if (c.name.startsWith("Ace ") || c.name.startsWith("Ace of")) numerology.aces++;
    else if (c.name.startsWith("Five ") || c.name.startsWith("Five of")) numerology.fives++;
    else if (c.name.startsWith("Seven ") || c.name.startsWith("Seven of")) numerology.sevens++;
  }

  return {
    majors_count,
    element_bias,
    reversals_count,
    numerology,
  };
}

