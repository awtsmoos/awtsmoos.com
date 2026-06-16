// B"H
/** @file LifeMath.js @description Tiny deterministic math vessels for living wildlife. */
export function n(v, f = 0) { return Number.isFinite(Number(v)) ? Number(v) : f; }
export function clamp01(v) { return Math.max(0, Math.min(1, n(v))); }
export function dist2(a, b) { const dx = n(a && a.x) - n(b && b.x), dz = n(a && a.z) - n(b && b.z); return dx * dx + dz * dz; }
export function dist(a, b) { return Math.sqrt(dist2(a, b)); }
export function hash(a = 0, b = 0, c = 0) { const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return x - Math.floor(x); }
export function angleTo(a, b) { return Math.atan2(n(b.x) - n(a.x), n(b.z) - n(a.z)); }
export function around(center, radius, seed) { const a = hash(seed, 1) * Math.PI * 2, r = Math.sqrt(hash(seed, 2)) * radius; return { x:n(center.x) + Math.cos(a) * r, z:n(center.z) + Math.sin(a) * r }; }
export function steerAway(from, danger, radius = 12) { const dx = n(from.x) - n(danger.x), dz = n(from.z) - n(danger.z), l = Math.hypot(dx, dz) || 1; return { x:n(from.x) + dx / l * radius, z:n(from.z) + dz / l * radius }; }
export function timePhase(dayTime = 0) { const t = ((dayTime % 1) + 1) % 1; if (t < .24) return "morning"; if (t < .58) return "day"; if (t < .78) return "evening"; return "night"; }
export function posOf(actor) { const p = actor && actor.position ? actor.position : actor || {}; return { x:n(p.x), y:n(p.y), z:n(p.z) }; }
export function dataOf(actor) { if (!actor.userData) actor.userData = {}; return actor.userData; }
