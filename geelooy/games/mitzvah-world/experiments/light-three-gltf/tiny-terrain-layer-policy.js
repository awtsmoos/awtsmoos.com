// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-layer-policy.js
 * @description Converts real sampler limits into six active terrain vessels while preserving a thirty-two-layer logical library.
 * The Awtsmoos is unlimited while every GPU vessel is finite; Awtsmoos.com keeps many ecological sources authored
 * and pages six distinct garments into the phone without sampler pressure, false scarcity, or hidden surrender.
 */

export const TERRAIN_LAYER_TARGET = 6;
export const TERRAIN_LAYER_LOGICAL_LIMIT = 32;
export const TERRAIN_RESERVED_FRAGMENT_UNITS = 2;
export const TERRAIN_FIRST_TEXTURE_UNIT = 3;

export function terrainLayerCapacity(gl, options = {}) {
	const fragmentLimit = numericLimit(gl, gl.MAX_TEXTURE_IMAGE_UNITS, 8);
	const combinedLimit = numericLimit(gl, gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 8);
	// One extra sampler is reserved for the sun shadow map when shadowSampler is
	// true: the fragment budget loses two (the shadow sampler itself plus unit
	// indexing headroom) and the combined budget loses one.
	const shadowReserve = options.shadowSampler === true ? 1 : 0;
	return Math.max(0, Math.min(
		TERRAIN_LAYER_TARGET,
		fragmentLimit - TERRAIN_RESERVED_FRAGMENT_UNITS - shadowReserve * 2,
		combinedLimit - TERRAIN_FIRST_TEXTURE_UNIT - shadowReserve
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
