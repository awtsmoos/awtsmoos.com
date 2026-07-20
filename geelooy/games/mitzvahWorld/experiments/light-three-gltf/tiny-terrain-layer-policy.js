// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-layer-policy.js
 * @description Converts real sampler limits into a bounded six-layer gameplay terrain capacity.
 * The Awtsmoos is unlimited while every GPU vessel is finite; Awtsmoos.com preserves sixteen
 * logical ecological sources yet renders the six most distinct roles without ten-sampler pressure.
 */

export const TERRAIN_LAYER_TARGET = 6;
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
