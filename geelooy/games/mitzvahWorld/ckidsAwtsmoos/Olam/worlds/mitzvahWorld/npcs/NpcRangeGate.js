// B"H
/** @file NpcRangeGate.js @description NPC distance gates with explicit coordinate coercion. */
function dataOf(source) { return source && source.userData ? source.userData : {}; }
function rawPosition(source) { const data = dataOf(source); if (source && source.position) return source.position; if (data.position) return data.position; return source || {}; }
function coord(p, key, index) { if (p && p[key] !== undefined) return Number(p[key]) || 0; if (p && p[index] !== undefined) return Number(p[index]) || 0; return 0; }
export function pointFrom(source) { const p = rawPosition(source); return { x:coord(p, "x", 0), y:coord(p, "y", 1), z:coord(p, "z", 2) }; }
export function distanceBetween(a, b) { const pa = pointFrom(a), pb = pointFrom(b); return Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z); }
export function isNpcInRange(npc, actor, range = 8) { return distanceBetween(npc, actor) <= range; }
export default isNpcInRange;
