// B"H
export const FOOT_GROUND_EPSILON = 0.01;
export const GROUNDING_SYSTEM = "player-foot-ground-contract-20260701-bh3";

export function numberOr(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function vec(v) {
  return v ? { x:Number(v.x), y:Number(v.y), z:Number(v.z) } : null;
}
