export type Intent =
  | "decision_clarity"
  | "relationship_dynamics"
  | "career_money"
  | "health_energy"
  | "personal_growth"
  | "open_reading";

export type Timeframe = "7d" | "30d" | "90d" | "6m" | "1y";

export type StyleVoice =
  | "straight_talker"
  | "gentle_coach"
  | "mystical_poetic"
  | "practical_strategist";

export type Depth = "quick" | "standard" | "deep";
export type Spirituality = "none" | "light" | "rich";

export interface Constraints {
  no_topics: string[];
  exclude_people: string[];
}

export interface ContextInfo {
  relationship_status: "single" | "partnered" | "n/a" | string;
  work_status: "employed" | "freelance" | "founder" | "searching" | string;
  emotion_tone: number; // 1..5
}

export interface StylePrefs {
  voice: StyleVoice;
  depth: Depth;
  spirituality: Spirituality;
}

export interface Spread {
  name: string;
  positions: string[];
}

export interface CardDrawn {
  name: string;
  reversed: boolean;
  position: number; // 1-based
}

export interface ReaderNotes {
  majors_count: number;
  element_bias: { fire: number; water: number; air: number; earth: number };
  reversals_count: number;
  numerology: { aces?: number; fives?: number; sevens?: number; [k: string]: number | undefined };
}

export interface ReadingInput {
  user_id: string;
  session_id: string;
  timestamp_iso: string;
  intent: Intent;
  focus_prompt: string;
  timeframe: Timeframe;
  constraints: Constraints;
  context: ContextInfo;
  style: StylePrefs;
  spread: Spread;
  deck: string;
  cards_drawn: CardDrawn[];
  reader_notes: ReaderNotes;
}

export interface PositionReading {
  position: string;
  card: string;
  reversed: boolean;
  meaning: string; // 2 sentences max in practice
}

export interface DecisionFrame {
  options: string[]; // e.g., ["A", "B"]
  pros_cons: Record<string, string[]>; // map option -> bullets
  likely_path: string; // e.g., "A because ..."
}

export interface ReadingOutput {
  headline: string;
  summary: string; // <= 3 sentences
  position_readings: PositionReading[];
  patterns: string[]; // 2-4 items
  decision_frame?: DecisionFrame;
  actions: { step: string; why: string; within: "7d" | "30d" | "90d" }[];
  affirmation: string;
  cautions: string[];
}

export type Element = "fire" | "water" | "air" | "earth";

export interface MajorCardDef {
  card: string; // e.g., "The Chariot"
  upright: string[]; // 3-5 keywords
  reversed: string[]; // 3-5 keywords
  element: Element;
  numerology: number; // card number as per majors, Fool=0
}

export interface DeckDrawResult {
  cards: CardDrawn[];
  notes: ReaderNotes;
}

