// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meadowGrassTints.js
 * @description Deterministic per-instance grass tint palettes for the dream meadow.
 * The Awtsmoos renews each blade's garment before the sun can name it green;
 * Awtsmoos.com lets golden-hour patches, deep clumps, and cool night blades live
 * side by side, so a meadow reads as living land rather than one flat green sheet.
 */

import { createGrassRandom } from "../../geometry/grass/grassRandom.js";

/**
 * Named tint palettes (linear-ish 0..1 RGB multipliers applied over the shader's
 * root-to-tip green ramp). Golden-hour meadow matches the dream-sunrise reference:
 * sunlit gold blades, deep green clumps, dry straw accents.
 */
export const MEADOW_GRASS_TINT_PALETTES = Object.freeze({
	'dream-meadow': Object.freeze([
		[1.06, 1.02, 0.78],
		[0.92, 1.05, 0.72],
		[1.18, 1.0, 0.55],
		[0.75, 0.95, 0.62],
		[1.0, 1.12, 0.85],
		[0.62, 0.82, 0.5]
	]),
	'night-meadow': Object.freeze([
		[0.55, 0.72, 0.62],
		[0.48, 0.66, 0.58],
		[0.62, 0.78, 0.66],
		[0.42, 0.58, 0.52]
	]),
	'forest-floor': Object.freeze([
		[0.5, 0.78, 0.45],
		[0.42, 0.68, 0.4],
		[0.58, 0.85, 0.5],
		[0.36, 0.6, 0.36]
	])
});

/** Low-frequency spatial patchiness so tint drifts across the field in clumps. */
function patchNoise(x, z, scale, seedHash) {
	const cellX = Math.floor(x / scale);
	const cellZ = Math.floor(z / scale);
	const hash = Math.sin(cellX * 127.1 + cellZ * 311.7 + seedHash * 0.731) * 43758.5453;
	return hash - Math.floor(hash);
}

/**
 * Builds one RGB tint per grass instance.
 * @param {object} fieldMesh Output of createGrassFieldMesh (instanceOffsets, instanceCount).
 * @param {object} [options={}] { palette: 'dream-meadow', seed, patchScale, jitter }
 * @returns {Float32Array} instanceCount * 3 tints.
 */
export function createMeadowGrassTints(fieldMesh, options = {}) {
	const count = Math.max(0, Math.floor(fieldMesh?.instanceCount ?? 0));
	const tints = new Float32Array(count * 3);
	if (!count) return tints;
	const paletteName = options.palette || 'dream-meadow';
	const palette = MEADOW_GRASS_TINT_PALETTES[paletteName] || MEADOW_GRASS_TINT_PALETTES['dream-meadow'];
	const random = createGrassRandom(options.seed ?? 'awtsmoos-meadow-tint');
	const seedHash = hashSeed(String(options.seed ?? 'awtsmoos-meadow-tint'));
	const offsets = fieldMesh.instanceOffsets || new Float32Array(count * 3);
	const patchScale = Math.max(1, Number(options.patchScale ?? 9));
	const jitter = Math.max(0, Number(options.jitter ?? 0.14));
	for (let index = 0; index < count; index += 1) {
		const x = offsets[index * 3] || 0;
		const z = offsets[index * 3 + 2] || 0;
		const patch = patchNoise(x, z, patchScale, seedHash);
		const pickIndex = Math.min(
			palette.length - 1,
			Math.floor(patch * palette.length * 0.999 + random.next() * 0.9)
		);
		const base = palette[Math.max(0, pickIndex)];
		for (let channel = 0; channel < 3; channel += 1) {
			const wobble = 1 + (random.next() * 2 - 1) * jitter;
			tints[index * 3 + channel] = Math.max(0.05, base[channel] * wobble);
		}
	}
	return tints;
}

/** Deterministic 32-bit string hash for the patch field. */
function hashSeed(text) {
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
