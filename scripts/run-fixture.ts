#!/usr/bin/env -S node --enable-source-maps
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { composePrompt } from "../src/lib/prompt";
import { runModel } from "../src/lib/llm";
import { validateReadingOutput } from "../src/lib/validate";

const name = process.argv[2] || "decision_clarity";
const mode = process.argv[3] || "print"; // print | call
const fixturePath = resolve(process.cwd(), `fixtures/${name}.json`);
const data = JSON.parse(readFileSync(fixturePath, "utf-8"));

const { system, instruction } = composePrompt(data);

if (mode === "print") {
  console.log("--- SYSTEM ---\n" + system + "\n\n--- INSTRUCTION ---\n" + instruction);
  process.exit(0);
}

(async () => {
  const res = await runModel(data);
  console.log("--- RAW ---\n" + res.raw + "\n");
  if (res.jsonText) console.log("--- JSON (repaired) ---\n" + res.jsonText + "\n");
  if (res.output) {
    const val = validateReadingOutput(res.output);
    console.log("Validation:", val);
  } else {
    console.error("No valid output:", res.errors);
    process.exitCode = 1;
  }
})();

