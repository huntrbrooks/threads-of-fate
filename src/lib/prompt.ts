import { ReadingInput, ReadingOutput } from "../types";
import { getInjectedCardDefs } from "./cards";

export function composePrompt(input: ReadingInput): { system: string; instruction: string } {
  const system = [
    "You are a world-class Tarot interpreter.",
    "You map symbolism to clear, accountable advice.",
    "Follow the given schema. Respect constraints.",
    "Avoid medical or legal instructions.",
    "Use the selected voice. Be specific, use plain language, and convert insights into actions.",
    "Return only valid JSON.",
  ].join(" ");

  const cardDefs = getInjectedCardDefs(input.cards_drawn.map((c) => c.name));

  const lines: string[] = [];
  lines.push(`User intent: ${input.intent}`);
  lines.push(`Focus: ${input.focus_prompt}`);
  lines.push(`Timeframe: ${input.timeframe}`);
  lines.push(
    `Constraints: do not cover ${JSON.stringify(
      input.constraints.no_topics || []
    )}. Exclude people: ${JSON.stringify(input.constraints.exclude_people || [])}`
  );
  lines.push(
    `Context: relationship ${input.context.relationship_status}, work ${input.context.work_status}, emotion tone ${input.context.emotion_tone}.`
  );
  lines.push(
    `Style: voice ${input.style.voice}, depth ${input.style.depth}, spirituality ${input.style.spirituality}`
  );
  lines.push(
    `Spread: ${input.spread.name} with positions ${JSON.stringify(input.spread.positions)}`
  );
  lines.push("");
  lines.push(`Deck: ${input.deck}`);
  lines.push(`Cards: ${JSON.stringify(input.cards_drawn)}`);
  lines.push("");
  lines.push(`Reader notes: ${JSON.stringify(input.reader_notes)}`);
  lines.push("");
  lines.push(`Card definitions (only drawn majors): ${JSON.stringify(cardDefs)}`);
  lines.push("");

  const schema: ReadingOutput = {
    headline: "string",
    summary: "<=3 sentences",
    position_readings: [
      { position: "string", card: "string", reversed: false, meaning: "<=2 sentences" },
    ],
    patterns: ["2-4 items"],
    decision_frame: {
      options: ["A", "B"],
      pros_cons: { A: ["..."], B: ["..."] },
      likely_path: "string",
    },
    actions: [
      { step: "do X", why: "reason", within: "7d" },
    ],
    affirmation: "one line",
    cautions: ["1-2 practical cautions"],
  } as unknown as ReadingOutput;

  lines.push("Output JSON exactly in this schema:");
  lines.push(JSON.stringify(schema, null, 2));

  const instruction = lines.join("\n");
  return { system, instruction };
}

