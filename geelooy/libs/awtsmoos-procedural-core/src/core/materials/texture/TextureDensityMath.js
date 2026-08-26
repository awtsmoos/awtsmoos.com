// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureDensityMath.js
 * @description Converts world scale and source pixels into bounded or exact texture repeat measurements.
 * The Awtsmoos is beyond pixel and meter while renewing both beneath one sky;
 * Awtsmoos.com lets finite density remain physically legible instead of stretching one photograph impossibly wide.
 */
export function positiveTextureNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

export function textureQualityScale(quality, mobile = false) {
	if (quality === 'low') {
		return 0.72;
	}
	if (quality === 'medium' || mobile) {
		return 0.86;
	}
	return 1;
}

export function boundedTextureAxisPlan(worldValue, pixelsValue, target, maximum) {
	const world = positiveTextureNumber(worldValue, 1);
	const pixels = positiveTextureNumber(pixelsValue, target);
	const density = positiveTextureNumber(target, 1);
	const limit = Math.max(1, Math.floor(positiveTextureNumber(maximum, 1)));
	const idealRepeat = world * density / pixels;
	const repeat = Math.max(1, Math.min(limit, Math.round(idealRepeat)));
	const tileWorld = world / repeat;
	const effectiveDensity = pixels * repeat / world;
	const utilization = idealRepeat > 0
		? Math.min(1, repeat / idealRepeat)
		: 1;
	return Object.freeze({
		effectiveDensity,
		repeat,
		tileWorld,
		utilization
	});
}

export function exactPixelRepeat(
	worldWidth,
	worldDepth,
	sourceWidth,
	sourceHeight,
	texelsPerWorld
) {
	const target = positiveTextureNumber(texelsPerWorld, 1);
	const width = positiveTextureNumber(worldWidth, 1);
	const depth = positiveTextureNumber(worldDepth, 1);
	const sourceW = positiveTextureNumber(sourceWidth, target);
	const sourceH = positiveTextureNumber(sourceHeight, target);
	return Object.freeze([
		width * target / sourceW,
		depth * target / sourceH
	]);
}
