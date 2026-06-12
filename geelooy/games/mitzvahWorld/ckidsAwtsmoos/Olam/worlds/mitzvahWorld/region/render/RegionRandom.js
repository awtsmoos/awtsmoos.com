// B"H
/** @file RegionRandom.js @description Deterministic random helpers for living-region placement. */
export const fract = x => x - Math.floor(x);
export function rand(x = 0, z = 0, s = 1) { return fract(Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453); }
export function jitter(x, z, radius = 1, seed = 1) { return [(rand(x, z, seed) - .5) * radius, (rand(x, z, seed + 9) - .5) * radius]; }
export function choose(list, x, z, seed = 1) { return list[Math.floor(rand(x, z, seed) * list.length) % list.length]; }
export function range(count, fn) { const out = []; for (let i = 0; i < count; i++) out.push(fn(i)); return out; }
