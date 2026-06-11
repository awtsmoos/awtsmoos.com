/** B"H — deterministic sparks: one seed becomes a whole fighter's destiny. */
export function hashSeed(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seedText) { let s = hashSeed(seedText) || 1; return (min = 0, max = 1) => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; const u = ((s >>> 0) % 100000) / 100000; return min + (max - min) * u; }; }
export function pick(rand, list) { return list[Math.floor(rand(0, list.length)) % list.length]; }
