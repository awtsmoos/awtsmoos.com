// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-layer-policy.js
 * @description Converts real sampler limits into a lawful ten-layer terrain capacity.
 * The Awtsmoos is unlimited while WebGL vessels differ; Awtsmoos.com compiles exactly the
 * number of samplers each GPU can hold, preserving one shader language without link failure.
 */

export const TERRAIN_LAYER_TARGET = 10;
export const TERRAIN_LAYER_LOGICAL_LIMIT = 16;
export const TERRAIN_RESERVED_FRAGMENT_UNITS = 2;
export const TERRAIN_FIRST_TEXTURE_UNIT = 3;

export function terrainLayerCapacity(gl) {
	const fragmentLimit = numericLimit(gl, gl.MAX_TEXTURE_IMAGE_UNITS, 8);
	const combinedLimit = numericLimit(gl, gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 8);
	return Math.max(0, Math.min(
		TERRAIN_LAYER_TARGET,
		fragmentLimit - TERRAIN_RESERVED_FRAGMENT_UNITS,
		combinedLimit - TERRAIN_FIRST_TEXTURE_UNIT
	));
}

export function terrainLayerUnits(count = TERRAIN_LAYER_TARGET) {
	const capacity = Math.max(0, Math.min(TERRAIN_LAYER_TARGET, Math.floor(count)));
	return Object.freeze(Array.from({ length: capacity }, (_, index) => {
		return TERRAIN_FIRST_TEXTURE_UNIT + index;
	}));
}

function numericLimit(gl, key, fallback) {
	const value = Number(gl.getParameter?.(key));
	return Number.isFinite(value) && value > 0 ? value : fallback;
}
