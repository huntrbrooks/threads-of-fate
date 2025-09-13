export type ModerationResult = { ok: true; focus_prompt: string } | { ok: false; reason: string; suggestion?: string };

const banned = [
  /diagnos(e|is|ing)/i,
  /prescription|prescribe/i,
  /court|lawsuit|sue|legal advice|contract drafting/i,
  /death prediction|when will i die/i,
];

export function moderateInput(focus: string): ModerationResult {
  for (const rx of banned) {
    if (rx.test(focus)) {
      return {
        ok: false,
        reason: "Health/medical or legal outcomes are out of scope.",
        suggestion: "Reframe to choices, support, or next steps you control.",
      };
    }
  }
  return { ok: true, focus_prompt: focus };
}

