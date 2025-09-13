const PRO_KEY = "tof_pro_flag";

export type FeatureKey =
  | "deep_spreads"
  | "export_json"
  | "calendar_export"
  | "server_push";

export function getPro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "1";
}

export function setPro(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRO_KEY, on ? "1" : "0");
}

export function canUse(feature: FeatureKey): boolean {
  const pro = getPro();
  switch (feature) {
    case "deep_spreads":
    case "export_json":
    case "calendar_export":
    case "server_push":
      return pro;
    default:
      return true;
  }
}

