import { Depth, Intent, ReadingInput, StylePrefs } from "../types";
import { pickSpread } from "./spreads";
import { computeReaderNotes, drawCards } from "./draw";

export interface PrepareParams {
  user_id: string;
  session_id: string;
  timestamp_iso: string;
  intent: Intent;
  focus_prompt: string;
  timeframe: "7d" | "30d" | "90d" | "6m" | "1y";
  constraints?: { no_topics?: string[]; exclude_people?: string[] };
  context?: { relationship_status?: string; work_status?: string; emotion_tone?: number };
  style?: Partial<StylePrefs>;
  depth?: Depth; // override style.depth for spread selection if provided
  deck?: string;
  seed: string | number;
  allowReversals?: boolean;
}

export function prepareReadingInput(p: PrepareParams): ReadingInput {
  const style: StylePrefs = {
    voice: p.style?.voice || "straight_talker",
    depth: p.style?.depth || "standard",
    spirituality: p.style?.spirituality || "light",
  };
  const depth = p.depth || style.depth;
  const spread = pickSpread(p.intent, depth);
  const deck = p.deck || "RWS";
  const { cards } = drawCards({ seed: p.seed, deck, positions: spread.positions.length, allowReversals: p.allowReversals ?? true });
  const reader_notes = computeReaderNotes(cards);

  const guardrails = new Set<string>(["medical diagnosis", "prescriptions", "legal outcomes", "third-party surveillance"]);
  const givenNoTopics = new Set<string>((p.constraints?.no_topics || []).map((s) => s.toLowerCase()));
  // Always enforce legal/medical avoidance via constraints as well as system prompt.
  const mergedNoTopics = new Set<string>([...givenNoTopics, ...guardrails]);

  return {
    user_id: p.user_id,
    session_id: p.session_id,
    timestamp_iso: p.timestamp_iso,
    intent: p.intent,
    focus_prompt: p.focus_prompt,
    timeframe: p.timeframe,
    constraints: {
      no_topics: Array.from(mergedNoTopics),
      exclude_people: p.constraints?.exclude_people || [],
    },
    context: {
      relationship_status: p.context?.relationship_status || "n/a",
      work_status: p.context?.work_status || "n/a",
      emotion_tone: p.context?.emotion_tone ?? 3,
    },
    style,
    spread,
    deck,
    cards_drawn: cards,
    reader_notes,
  };
}
