// B"H
/** @file RegionRandom.js @description Deterministic random helpers for living-region placement. */
export function fract(x = 0) { return x - Math.floor(x); }
export function rand(x = 0, z = 0, s = 1) {
  const v = Math.sin(Number(x) * 12.9898 + Number(z) * 78.233 + Number(s) * 37.719) * 43758.5453;
  return fract(v);
}
export function jitter(x, z, radius = 1, seed = 1) {
  return [(rand(x, z, seed) - .5) * radius, (rand(x, z, seed + 9) - .5) * radius];
}
export function choose(list = [], x = 0, z = 0, seed = 1) {
  if (!list.length) return null;
  return list[Math.floor(rand(x, z, seed) * list.length) % list.length];
}
export function range(count = 0, fn = i => i) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(fn(i));
  return out;
}
