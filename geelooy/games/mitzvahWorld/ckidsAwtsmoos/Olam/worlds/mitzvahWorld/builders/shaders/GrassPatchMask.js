/**
 * B"H
 * @file GrassPatchMask.js
 * @description
 * Helpers for point-defined grass/dirt terrain masks.
 *
 * The Awtsmoos reveals the seed of each grass patch as a small numeric
 * vessel: x, z, radius, and gain. This file keeps the vessel complete,
 * filling missing patches so the shader's fixed uniform array is never left
 * with a broken shape or an unfinished breath.
 */

export const MAX_GRASS_PATCHES = 16;


/**
 * Coerces an unknown patch field into a finite number.
 *
 * @param {any} value - The raw field from a grass patch definition.
 * @param {number} fallback - The value to use when the field cannot be trusted.
 * @returns {number} A finite number, ready to be packed into a THREE.Vector4.
 */
function toFiniteNumber(value, fallback) {
  const numericSeed = Number(value);
  return Number.isFinite(numericSeed) ? numericSeed : fallback;
}


/**
 * Normalizes arbitrary patch data into a fixed-length shader-uniform list.
 *
 * @param {Array<{x?:number,z?:number,radius?:number,gain?:number}>} [patches=[]] - Raw patch data from the world builder.
 * @returns {Array<{x:number,z:number,radius:number,gain:numer}>} Exactly MAX_GRASS_PATCHES safe patches.
 */
export function normalizeGrassPatches(patches = []) {
  const safe = Array.isArray(patches) ? patches.slice(0, MAX_GRASS_PATCHES) : [];

  while (safe.length < MAX_GRASS_PATCHES) {
    safe.push({ x: 0, z: 0, radius: 0, gain: 0 });
  }

  return safe.map(patch => ({
    x: toFiniteNumber(patch?.x, 0),
    z: toFiniteNumber(patch?.z, 0),
    radius: Math.max(0, toFiniteNumber(patch?.radius, 0)),
    gain: Math.max(0, toFiniteNumber(patch?.gain, 1))
  }));
}
