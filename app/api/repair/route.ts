import { NextRequest } from "next/server";
import { repairJSON } from "../../../src/lib/jsonRepair";
import { validateReadingOutput } from "../../../src/lib/validate";

export const runtime = "edge";

function json(data: any, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "POST, GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, authorization");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function OPTIONS() { return json({ ok: true }); }
export async function GET() { return json({ ok: true, status: "ready" }); }

type Payload = { text: string; validate?: boolean };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;
    if (!body?.text) return json({ ok: false, error: "Provide 'text'" }, { status: 400 });
    const repaired = repairJSON(body.text);
    if (!repaired.ok) return json({ ok: false, repaired: repaired.repaired || null, error: repaired.error }, { status: 422 });
    if (body.validate) {
      const v = validateReadingOutput(repaired.data);
      return json({ ok: v.ok, data: repaired.data, repaired: repaired.repaired || null, errors: v.errors });
    }
    return json({ ok: true, data: repaired.data, repaired: repaired.repaired || null });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, { status: 400 });
  }
}

