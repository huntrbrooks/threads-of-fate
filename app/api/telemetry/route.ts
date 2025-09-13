import { NextRequest } from "next/server";

export const runtime = "edge";
const store: any[] = [];

function json(data: any, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "POST, GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, authorization");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function OPTIONS() { return json({ ok: true }); }
export async function GET() { return json({ ok: true, count: store.length }); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    store.push({ ...body, t: Date.now() });
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, { status: 400 });
  }
}

