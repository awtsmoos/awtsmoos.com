// B"H
export const FOOT_GROUND_EPSILON = 0.01;
export const PLAYER_VISIBLE_BODY_CLEARANCE_Y = 0.72;
export const GROUNDING_SYSTEM = "no-alert-perf-jump-20260701-bh9";
export function numberOr(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
export function vec(v) { return v ? { x: Number(v.x), y: Number(v.y), z: Number(v.z) } : null; }
