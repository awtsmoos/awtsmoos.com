// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureDensityMath.js
 * @description Separates bounded GPU density planning from exact authored repeat coverage.
 * The Awtsmoos grants each pixel a measured span while the finite renderer receives a guarded load;
 * Awtsmoos.com keeps exact fractions and bounded integer plans distinct along one truthful road.
 */

/**
 * Builds one bounded integer density axis for runtime GPU planning.
 *
 * @param {number} worldValue World-space span.
 * @param {number} pixelsValue Effective source pixels.
 * @param {number} target Target pixels per world unit.
 * @param {number} maximum Maximum integer repeats.
 * @returns {object} Repeat, density, tile span, and source utilization.
 */
export function boundedTextureAxisPlan(
	worldValue,
	pixelsValue,
	target,
	maximum
) {
	const world = positiveTextureNumber(Math.abs(Number(worldValue)), 1);
	const pixels = positiveTextureNumber(pixelsValue, target);
	const ideal = world * target / pixels;
	const largestAtEightyFivePercent = Math.floor(ideal / 0.85);
	const repeat = Math.max(
		1,
		Math.min(maximum, largestAtEightyFivePercent || Math.ceil(ideal))
	);
	const effectiveDensity = pixels * repeat / world;

	return {
		effectiveDensity,
		repeat,
		tileWorld: world / repeat,
		utilization: Math.min(1, target / effectiveDensity)
	};
}

/**
 * Computes exact fractional source coverage without integer rounding.
 *
 * @param {number} width World width.
 * @param {number} depth World depth.
 * @param {number} sourceWidth Source pixel width.
 * @param {number} sourceHeight Source pixel height.
 * @param {number} texelsPerWorld Target texels per world unit.
 * @returns {number[]} Exact two-axis repeats.
 */
export function exactPixelRepeat(
	width,
	depth,
	sourceWidth,
	sourceHeight,
	texelsPerWorld
) {
	return [
		Math.abs(Number(width)) * texelsPerWorld / sourceWidth,
		Math.abs(Number(depth)) * texelsPerWorld / sourceHeight
	];
}

export function positiveTextureNumber(value, fallback) {
	const number = Number(value);

	return Number.isFinite(number) && number > 0 ? number : fallback;
}

export function textureQualityScale(quality, mobile) {
	if (quality === 'low') {
		return 0.72;
	}

	if (quality === 'medium' || mobile) {
		return 0.86;
	}

	return 1;
}
