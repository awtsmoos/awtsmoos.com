// B"H
/**
 * @file GrassPatchMask.js
 * @description Fixed-length grass patch masks for terrain shaders, parser-clear.
 */
export const MAX_GRASS_PATCHES = 16;
function toFiniteNumber(value, fallback) { const numericSeed = Number(value); return Number.isFinite(numericSeed) ? numericSeed : fallback; }
function field(patch, key, fallback) { return patch && patch[key] !== undefined ? patch[key] : fallback; }
function normalizeOne(patch) { return { x:toFiniteNumber(field(patch, "x", 0), 0), z:toFiniteNumber(field(patch, "z", 0), 0), radius:Math.max(0, toFiniteNumber(field(patch, "radius", 0), 0)), gain:Math.max(0, toFiniteNumber(field(patch, "gain", 1), 1)) }; }
export function normalizeGrassPatches(patches = []) { const safe = Array.isArray(patches) ? patches.slice(0, MAX_GRASS_PATCHES) : []; while (safe.length < MAX_GRASS_PATCHES) safe.push({ x:0, z:0, radius:0, gain:0 }); return safe.map(normalizeOne); }
