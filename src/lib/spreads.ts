import { Depth, Intent, Spread } from "../types";

const SPREADS: Record<Intent, Spread> = {
  decision_clarity: {
    name: "Forked Road Six",
    positions: [
      "You now",
      "Hidden factor",
      "Path A",
      "Path B",
      "Risk",
      "Most empowering next step",
    ],
  },
  relationship_dynamics: {
    name: "Mirror Five",
    positions: [
      "You",
      "Them",
      "Bridge",
      "Shadow",
      "Growth edge",
    ],
  },
  career_money: {
    name: "Ladder Seven",
    positions: [
      "Base",
      "Current rung",
      "Next rung",
      "Block",
      "Ally",
      "Leverage",
      "Outcome",
    ],
  },
  health_energy: {
    name: "Vital Four",
    positions: ["Body", "Mind", "Habits", "Support"],
  },
  personal_growth: {
    name: "Path Nine",
    positions: [
      "Past wound",
      "Current pattern",
      "Strength",
      "Teacher",
      "Practice",
      "Test",
      "Resource",
      "Mantra",
      "Near outcome",
    ],
  },
  open_reading: {
    name: "Classic Three",
    positions: ["Past", "Present", "Probable trajectory"],
  },
};

const CLASSIC_THREE: Spread = SPREADS.open_reading;

export function pickSpread(intent: Intent, depth: Depth): Spread {
  if (depth === "quick") return CLASSIC_THREE;
  return SPREADS[intent];
}

export function spreadByIntent(intent: Intent): Spread {
  return SPREADS[intent];
}

