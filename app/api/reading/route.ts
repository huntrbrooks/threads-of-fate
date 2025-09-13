import { NextRequest } from "next/server";
import { runModel, type RunModelOptions } from "../../../src/lib/llm";
import { composePrompt } from "../../../src/lib/prompt";
import { prepareReadingInput, type PrepareParams } from "../../../src/lib/prepare";
import { moderateInput } from "../../../src/lib/moderation";
import type { ReadingInput } from "../../../src/types";

export const runtime = "edge";

function json(data: any, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "POST, GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, authorization");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function OPTIONS() {
  return json({ ok: true });
}

export async function GET() {
  return json({ ok: true, status: "ready", vendor: process.env.LLM_VENDOR || "anthropic" });
}

type Payload = {
  mode?: "compose" | "run";
  input?: ReadingInput;
  prepare?: PrepareParams;
  llm?: RunModelOptions;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;
    const mode = body.mode || "run";
    const baseInput: ReadingInput = body.input
      ? body.input
      : body.prepare
      ? prepareReadingInput(body.prepare)
      : (() => {
          throw new Error("Provide either 'input' or 'prepare'");
        })();
    // Moderation pass on focus prompt (simple keyword filter -> suggest reframe)
    const mod = moderateInput(baseInput.focus_prompt);
    if (!mod.ok) {
      return json({ ok: false, error: mod.reason, suggestion: mod.suggestion }, { status: 400 });
    }
    const input = { ...baseInput, focus_prompt: mod.focus_prompt };

    if (mode === "compose") {
      const { system, instruction } = composePrompt(input);
      return json({ ok: true, system, instruction, input });
    }

    const res = await runModel(input, body.llm);
    if (!res.output) {
      return json({ ok: false, error: res.errors || ["Unknown error"], raw: res.raw, jsonText: res.jsonText }, { status: 422 });
    }
    return json({ ok: true, output: res.output, jsonText: res.jsonText, repaired: res.repaired, input });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, { status: 400 });
  }
}
