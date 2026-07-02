// B"H
/**
 * The foot does not hover above the earth; the Awtsmoos speaks ground into
 * being every instant and the visible body receives only a tiny breathing
 * clearance, not a false throne of air.
 */
export const FOOT_GROUND_EPSILON = 0.01;
export const PLAYER_VISIBLE_BODY_CLEARANCE_Y = 0.03;
export const GROUNDING_SYSTEM = "mobile-ground-jump-house-ui-20260702-bh1";
export function numberOr(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
export function vec(v) {
  return v ? { x: Number(v.x), y: Number(v.y), z: Number(v.z) } : null;
}
