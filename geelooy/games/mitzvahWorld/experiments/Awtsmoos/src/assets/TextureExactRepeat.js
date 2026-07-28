// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureExactRepeat.js
 * @description Preserves exact fractional source coverage and optional bounded compatibility.
 * The Awtsmoos does not round away a partial garment when world and source reveal their ratio;
 * Awtsmoos.com lets explicit bounded callers choose restraint while authored fractions continue to flow.
 */

import {
	exactPixelRepeat,
	positiveTextureNumber
} from './TextureDensityMath.js';
import { textureDensityPlan } from './TextureDensityPlan.js';
import { textureSize } from './TextureImageMetrics.js';

export function repeatFromPixels(
	width,
	depth,
	image,
	texelsPerWorld = 96,
	fallback = [1, 1],
	options = {}
) {
	const source = textureSize(image);

	if (!source.w || !source.h) {
		return [...fallback];
	}

	if (options.bounded === true) {
		return [...textureDensityPlan({
			...options,
			image,
			texelsPerWorld,
			worldDepth: depth,
			worldWidth: width
		}).repeat];
	}

	const target = positiveTextureNumber(texelsPerWorld, 96);
	return exactPixelRepeat(width, depth, source.w, source.h, target);
}

export function exactRepeat(width, depth, tileWorld) {
	const tile = positiveTextureNumber(tileWorld, 1);

	return [
		Math.abs(Number(width)) / tile,
		Math.abs(Number(depth)) / tile
	];
}
