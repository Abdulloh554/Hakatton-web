import type { Location } from "@hakaton/shared";

export type TargetClass = "mars" | "moon" | "both";

export function targetLabel(target: Location["target"]): string {
  return target === "Ikkalasi" ? "Mars va Oy" : target;
}

export function targetClass(target: Location["target"]): TargetClass {
  return target === "Ikkalasi" ? "both" : target === "Mars" ? "mars" : "moon";
}

export function formatCoordinates(lat: number, lng: number): string {
  const latitude = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const longitude = `${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? "E" : "W"}`;
  return `${latitude}, ${longitude}`;
}

/** Equirectangular percentages: the same projection the 2D fallback and the 3D globe share. */
export function projectToMap(lat: number, lng: number): { left: number; top: number } {
  const left = ((lng + 180) / 360) * 100;
  const top = ((90 - lat) / 180) * 100;
  return { left: Math.min(98, Math.max(2, left)), top: Math.min(96, Math.max(4, top)) };
}