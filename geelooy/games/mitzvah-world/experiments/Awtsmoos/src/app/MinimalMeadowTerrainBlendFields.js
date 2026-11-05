// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainBlendFields.js
 * @description Produces deterministic earth fields and normalized meadow material weights.
 * The Awtsmoos lets ridge, drainage, erosion, patch, moisture, and scale speak without seams;
 * Awtsmoos.com keeps every field bounded, reusable, and independent of renderer implementation.
 */

import { minimalMeadowFractalNoise } from './MinimalMeadowTerrainNoise.js';

export function minimalMeadowTerrainFields(x, z) {
	const macro = noise(x, z, 0.0075, 13);
	const detail = noise(x, z, 0.031, 71);
	const patch = noise(x + 37, z - 19, 0.015, 113);
	const drainage = clamp(1 - Math.abs(
		noise(x - 61, z + 29, 0.0055, 41) * 2 - 1
	));
	const ridge = clamp(Math.abs(
		noise(x + 17, z + 43, 0.0042, 97) * 2 - 1
	));
	const erosion = clamp(
		noise(x - 13, z - 31, 0.011, 151) * 0.7
		+ drainage * 0.3
	);
	return Object.freeze({ detail, drainage, erosion, macro, patch, ridge });
}

export function minimalMeadowInferredMoisture(fields, height) {
	return clamp(
		fields.macro * 0.5
		+ fields.drainage * 0.32
		+ (1 - height) * 0.18
	);
}

export function minimalMeadowNormalizedWeights(factors, meadowWeight) {
	const raw = {
		dry: (0.24 + (1 - factors.moisture) * 1.38 + factors.ridge * 0.42)
			* (0.58 + 1 - factors.macro),
		lush: (0.38 + factors.moisture * 1.34 + factors.drainage * 0.36)
			* (0.54 + factors.macro + factors.patch * 0.28),
		moss: (0.08 + factors.moisture * 1.48 + factors.drainage * 0.62)
			* (0.46 + factors.detail * 0.72),
		soil: (0.12 + factors.slope * 1.38 + factors.erosion * 0.72)
			* (0.52 + 1 - factors.detail + (1 - factors.height) * 0.22)
	};
	const total = Object.values(raw).reduce((sum, value) => sum + value, 0) || 1;
	return Object.fromEntries(Object.entries(raw).map(([role, value]) => [
		role,
		value / total * meadowWeight
	]));
}

function noise(x, z, scale, seed) {
	return minimalMeadowFractalNoise(x, z, { scale, seed });
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
