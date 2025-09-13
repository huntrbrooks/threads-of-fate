export type ReadingRequest = {
  mode?: "compose" | "run";
  input?: any;
  prepare?: any;
  llm?: { vendor?: "anthropic" | "openai"; model?: string; temperature?: number; maxTokens?: number };
};

export async function postReading(body: ReadingRequest) {
  const res = await fetch("/api/reading", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Reading API error");
  return data;
}

export async function postRepair(text: string, validate = false) {
  const res = await fetch("/api/repair", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, validate }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Repair API error");
  return data;
}

