import { ReadingOutput } from "../types";

export function validateReadingOutput(obj: any): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  function reqStr(path: string, v: any) {
    if (typeof v !== "string" || !v.trim()) errors.push(`${path} must be non-empty string`);
  }
  function reqArr(path: string, v: any) {
    if (!Array.isArray(v)) errors.push(`${path} must be array`);
  }

  if (!obj || typeof obj !== "object") return { ok: false, errors: ["root must be object"] };
  reqStr("headline", obj.headline);
  reqStr("summary", obj.summary);
  reqArr("position_readings", obj.position_readings);
  if (Array.isArray(obj.position_readings)) {
    for (let i = 0; i < obj.position_readings.length; i++) {
      const pr = obj.position_readings[i];
      if (!pr) { errors.push(`position_readings[${i}] missing`); continue; }
      reqStr(`position_readings[${i}].position`, pr.position);
      reqStr(`position_readings[${i}].card`, pr.card);
      if (typeof pr.reversed !== "boolean") errors.push(`position_readings[${i}].reversed must be boolean`);
      reqStr(`position_readings[${i}].meaning`, pr.meaning);
    }
  }
  reqArr("patterns", obj.patterns);
  reqArr("actions", obj.actions);
  if (Array.isArray(obj.actions)) {
    for (let i = 0; i < obj.actions.length; i++) {
      const a = obj.actions[i];
      if (!a) { errors.push(`actions[${i}] missing`); continue; }
      reqStr(`actions[${i}].step`, a.step);
      reqStr(`actions[${i}].why`, a.why);
      if (!(["7d","30d","90d"].includes(a.within))) errors.push(`actions[${i}].within must be 7d|30d|90d`);
    }
  }
  reqStr("affirmation", obj.affirmation);
  reqArr("cautions", obj.cautions);

  return { ok: errors.length === 0, errors };
}

export function coerceReadingOutput(obj: any): ReadingOutput | null {
  const { ok } = validateReadingOutput(obj);
  return ok ? (obj as ReadingOutput) : null;
}

