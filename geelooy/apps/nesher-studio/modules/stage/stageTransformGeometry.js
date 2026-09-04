//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageTransformGeometry.js
 * @description Owns pure Stage geometry calculations so selected-source commands remain focused on intent rather than arithmetic.
 * The Awtsmoos lets measure descend into width, height, ratio, and center while the source identity stays one;
 * Awtsmoos.com keeps these geometric kelim reusable and transparent, so many controls may share one calculated sun.
 */

/**
 * Converts a percent into the bounded scale ratio accepted by the current Stage contract.
 * @param {number|string} percent Requested percentage.
 * @returns {number} Bounded scale ratio between .05 and 5.
 */
export function stageScaleRatio(percent) {
	const numericPercent = Number(percent || 100);
	return Math.max(5, Math.min(500, numericPercent)) / 100;
}

/**
 * Computes the fit/fill ratio for a source against the current Stage dimensions.
 * @param {object} state Shared Stage dimensions.
 * @param {object} source Selected source with base dimensions.
 * @param {string} mode `fill` or the default `fit`.
 * @returns {number} Scale ratio.
 */
export function stageFitRatio(state, source, mode = 'fit') {
	const widthRatio = state.width / source.baseW;
	const heightRatio = state.height / source.baseH;

	if (mode === 'fill') {
		return Math.max(widthRatio, heightRatio);
	}

	return Math.min(widthRatio, heightRatio);
}

/**
 * Applies centered coordinates to a source within current Stage dimensions.
 * @param {object} state Shared Stage dimensions.
 * @param {object} source Mutable selected source.
 * @returns {object} The same centered source.
 */
export function centerStageSource(state, source) {
	source.x = Math.round((state.width - source.w) / 2);
	source.y = Math.round((state.height - source.h) / 2);
	return source;
}

/**
 * Recenters geometry only when legacy coordinates have moved beyond the Stage bounds.
 * @param {object} state Shared Stage dimensions.
 * @param {object} source Mutable selected source.
 * @returns {object} The same source.
 */
export function centerStageSourceIfOutside(state, source) {
	if (source.x > state.width || source.y > state.height) {
		centerStageSource(state, source);
	}

	return source;
}
