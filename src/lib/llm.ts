import { composePrompt } from "./prompt";
import { ReadingInput, ReadingOutput } from "../types";
import { coerceReadingOutput } from "./validate";
import { repairJSON } from "./jsonRepair";

export type LLMVendor = "anthropic" | "openai";

export interface RunModelOptions {
  vendor?: LLMVendor;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface RunModelResult {
  raw: string;
  jsonText: string | null;
  output: ReadingOutput | null;
  repaired: boolean;
  errors?: string[];
}

export async function runModel(input: ReadingInput, opts: RunModelOptions = {}): Promise<RunModelResult> {
  const { system, instruction } = composePrompt(input);
  const vendor = opts.vendor || (process.env.LLM_VENDOR as LLMVendor) || "anthropic";
  const model = opts.model || process.env.LLM_MODEL || (vendor === "anthropic" ? "claude-3-5-sonnet-20240620" : "gpt-4o-mini");
  const temperature = opts.temperature ?? 0.2;
  const maxTokens = opts.maxTokens ?? 1200;

  const raw = await (vendor === "anthropic"
    ? callAnthropic(system, instruction, model, temperature, maxTokens)
    : callOpenAI(system, instruction, model, temperature, maxTokens));

  const repaired = repairJSON(raw);
  if (!repaired.ok) {
    return { raw, jsonText: repaired.repaired || null, output: null, repaired: true, errors: [repaired.error || "parse failed"] };
  }
  const output = coerceReadingOutput(repaired.data);
  if (!output) {
    return { raw, jsonText: repaired.repaired || null, output: null, repaired: true, errors: ["schema validation failed"] };
  }
  return { raw, jsonText: repaired.repaired || null, output, repaired: repaired.repaired !== undefined };
}

async function callAnthropic(system: string, instruction: string, model: string, temperature: number, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
  const body = {
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [
      { role: "user", content: instruction },
    ],
  } as const;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data = await res.json();
  // data.content is array of blocks; concat text parts
  const text = (data?.content || [])
    .map((b: any) => (b?.type === "text" ? b.text : ""))
    .join("")
    .trim();
  return text;
}

async function callOpenAI(system: string, instruction: string, model: string, temperature: number, maxTokens: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  // Use Chat Completions for wide compatibility.
  const body = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: instruction },
    ],
    response_format: { type: "json_object" },
  } as const;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return String(text).trim();
}

