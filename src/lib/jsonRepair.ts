// Lightweight JSON sanitization + repair helpers for model outputs.

export function stripFences(s: string): string {
  // Remove Markdown code fences and leading language hints.
  return s
    .replace(/^```(?:json)?/gi, "")
    .replace(/```$/g, "")
    .replace(/```/g, "")
    .trim();
}

export function extractJSONObject(text: string): string {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return text.slice(first, last + 1);
  }
  return text.trim();
}

function removeLineComments(s: string): string {
  // Remove // comments safely outside of strings.
  const lines = s.split(/\r?\n/);
  return lines
    .map((line) => {
      let out = "";
      let inStr: string | null = null;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const prev = i > 0 ? line[i - 1] : "";
        if (inStr) {
          out += ch;
          if (ch === inStr && prev !== "\\") inStr = null;
          continue;
        }
        if ((ch === '"' || ch === "'") && prev !== "\\") {
          inStr = ch;
          out += ch;
          continue;
        }
        if (ch === "/" && line[i + 1] === "/") {
          break; // strip rest of line
        }
        out += ch;
      }
      return out;
    })
    .join("\n");
}

function removeTrailingCommas(s: string): string {
  // Remove trailing commas before } or ]
  return s
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([\[{]\s*)(,\s*)+(?=[}\]])/g, "$1");
}

function normalizeBooleansNulls(s: string): string {
  return s.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null");
}

function preferDoubleQuotes(s: string): string {
  // Heuristic: replace single-quoted JSON-like strings with double quotes when used as keys or string values.
  // Avoid touching apostrophes inside words by requiring a colon or comma context.
  return s
    .replace(/'([^'\\\n\r]*)'\s*:/g, '"$1":') // keys
    .replace(/:\s*'([^'\\\n\r]*)'/g, ': "$1"'); // values
}

export function tryParseJSON(raw: string): { ok: true; data: any } | { ok: false; error: string } {
  try {
    const data = JSON.parse(raw);
    return { ok: true as const, data };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || String(e) };
  }
}

export function repairJSON(text: string): { ok: boolean; data?: any; repaired?: string; error?: string } {
  const stripped = stripFences(text);
  const sliced = extractJSONObject(stripped);

  // Attempt 1: raw parse.
  let res = tryParseJSON(sliced);
  if (res.ok) return { ok: true, data: res.data, repaired: sliced };

  // Heuristic repairs.
  let s = sliced;
  s = removeLineComments(s);
  s = normalizeBooleansNulls(s);
  s = preferDoubleQuotes(s);
  s = removeTrailingCommas(s);

  res = tryParseJSON(s);
  if (res.ok) return { ok: true, data: res.data, repaired: s };

  return { ok: false, error: res.error, repaired: s };
}

