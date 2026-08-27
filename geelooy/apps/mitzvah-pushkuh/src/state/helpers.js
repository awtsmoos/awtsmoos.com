// B"H
// Small helpers keep old sparks from breaking the new world.
export const clean = x => String(x || "").trim();
export function clamp(x, min, max) { const n = Number(x); return Math.max(min, Math.min(max, Number.isFinite(n) ? n : 3)); }
export function stamp(t, fallback) { const n = Number(t); return Number.isFinite(n) && n > 0 ? n : fallback; }
export function safeTime(t) { const n = Number(t); return Number.isFinite(n) && n > 0 ? n : null; }
export function endDay(now) { const d = new Date(now); d.setHours(23, 59, 59, 999); return d.getTime(); }
export function deadline(kind, now) { return { today: endDay(now), "3d": now + 2592e5, "7d": now + 6048e5, "30d": now + 2592e6 }[kind] || null; }
