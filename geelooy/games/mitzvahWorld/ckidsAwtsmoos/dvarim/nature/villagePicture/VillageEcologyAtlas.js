// B"H
/**
 * @file VillageEcologyAtlas.js
 * @description
 * Chapter 950: a shared invisible ecology map.
 * The village stops scattering decoration randomly. Soil, moisture, shade,
 * traffic, stone, age, and fertility become one deterministic atlas sampled by
 * roads, vegetables, moss, rocks, flowers, bark, cloth, and minerals.
 */
const fract = x => x - Math.floor(x);
const clamp01 = x => Math.max(0, Math.min(1, x));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
function hash(x, z, seed = 1) { return fract(Math.sin(x * 12.9898 + z * 78.233 + seed * 37.719) * 43758.5453); }
function noise(x, z, seed = 1) { const ix = Math.floor(x), iz = Math.floor(z), fx = smooth(fract(x)), fz = smooth(fract(z)); const a = mix(hash(ix, iz, seed), hash(ix + 1, iz, seed), fx); const b = mix(hash(ix, iz + 1, seed), hash(ix + 1, iz + 1, seed), fx); return mix(a, b, fz); }
function fbm(x, z, seed = 1) { let v = 0, a = .55, f = 1; for (let i = 0; i < 5; i++) { v += noise(x * f, z * f, seed + i * 13.7) * a; f *= 2.04; a *= .48; } return clamp01(v); }
const ROAD = [[-145,-42],[-112,-22],[-80,-8],[-45,2],[-10,10],[25,18],[62,31],[98,49],[135,72]];
function segmentDistance(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1; const t = clamp01(((px - ax) * dx + (pz - az) * dz) / l2); const x = ax + dx * t, z = az + dz * t; return Math.hypot(px - x, pz - z); }
export function ecologyAt(x = 0, z = 0) {
  const nx = x * .012, nz = z * .012;
  let roadD = 999; for (let i = 0; i < ROAD.length - 1; i++) roadD = Math.min(roadD, segmentDistance(x, z, ROAD[i][0], ROAD[i][1], ROAD[i + 1][0], ROAD[i + 1][1]));
  const traffic = clamp01(1 - roadD / 10);
  const moisture = clamp01(.18 + fbm(nx * 1.2, nz * 1.2, 4) * .72 - traffic * .18);
  const fertility = clamp01(fbm(nx * 1.7 + 19, nz * 1.7 - 3, 9) * .78 + moisture * .25 - traffic * .12);
  const shade = clamp01(fbm(nx * 2.4 - 5, nz * 2.4 + 11, 16) * .82 + (Math.abs(x) > 120 ? .15 : 0));
  const stone = clamp01(fbm(nx * 2.1 + 44, nz * 2.1 + 21, 22) * .9 + (Math.abs(x) + Math.abs(z) > 180 ? .2 : 0) - traffic * .1);
  const age = clamp01(fbm(nx * .8 - 18, nz * .8 + 33, 29) * .75 + traffic * .2);
  const mineral = clamp01(stone * .55 + fbm(nx * 5.3, nz * 5.3, 38) * .5);
  const soil = clamp01(.45 + fertility * .32 + moisture * .2 - stone * .22);
  return { x, z, roadD, traffic, moisture, fertility, shade, stone, age, mineral, soil, seed: hash(Math.floor(x), Math.floor(z), 101) };
}
export function ecologyPick(x, z, threshold, channel = "fertility") { return ecologyAt(x, z)[channel] > threshold; }
export function ecologyRoadPoints() { return ROAD.map(p => [...p]); }
export function ecologyRand(x, z, seed = 1) { return hash(x, z, seed); }
export function ecologyStats() { return { atlas: "deterministic-village-ecology", channels: ["soil", "moisture", "traffic", "shade", "stone", "age", "fertility", "mineral"], roadPoints: ROAD.length }; }
