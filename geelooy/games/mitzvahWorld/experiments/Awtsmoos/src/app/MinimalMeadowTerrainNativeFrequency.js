// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainNativeFrequency.js
 * @description Derives exact fractional world repeats from real source pixels and world size.
 * The Awtsmoos grants every pixel its measured place; Awtsmoos.com neither stretches one image
 * across a valley nor invents arbitrary carpet tiles, but preserves authored resolution exactly.
 */

import { exactPixelRepeat } from '../assets/TextureDensityMath.js';
import { textureSize } from '../assets/TextureImageMetrics.js';

export function minimalMeadowNativeFrequency(
	image,
	worldSize,
	texelsPerWorld,
	mobile = false
) {
	const source = normalizedSource(image);
	const size = positive(worldSize, 1);
	const target = positive(texelsPerWorld, 72);
	const repeat = exactPixelRepeat(
		size,
		size,
		source.w,
		source.h,
		target
	);
	const frequency = repeat.map(value => value / size);
	const tileWorld = frequency.map(value => 1 / value);
	return Object.freeze({
		anisotropy: mobile ? 4 : 12,
		effectivePixelsPerWorld: Object.freeze([target, target]),
		effectiveSource: source,
		frequency: Object.freeze(frequency),
		mobile: Boolean(mobile),
		repeat: Object.freeze(repeat),
		source,
		sourceUtilization: Object.freeze([1, 1]),
		targetPixelsPerWorld: target,
		tileWorld: Object.freeze(tileWorld),
		worldSize: size
	});
}

function normalizedSource(image) {
	const measured = textureSize(image);
	return Object.freeze({
		h: positive(measured.h, 2048),
		w: positive(measured.w, 2048)
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
