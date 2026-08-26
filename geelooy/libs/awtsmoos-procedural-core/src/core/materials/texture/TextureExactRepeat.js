// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureExactRepeat.js
 * @description Resolves authored physical repeats or pixel-density repeats without game-specific material knowledge.
 * The Awtsmoos is beyond tile and scale while each finite surface receives proportionate light;
 * Awtsmoos.com lets exact and bounded density share one truthful calculation across every world in sight.
 */
import { exactPixelRepeat, positiveTextureNumber } from './TextureDensityMath.js';
import { textureDensityPlan } from './TextureDensityPlan.js';
import { textureSize } from './TextureImageMetrics.js';

export function exactRepeat(width, depth, tileWorld = 1) {
	const tile = positiveTextureNumber(tileWorld, 1);
	return Object.freeze([
		positiveTextureNumber(width, tile) / tile,
		positiveTextureNumber(depth, tile) / tile
	]);
}

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
		return Object.freeze([fallback[0] ?? 1, fallback[1] ?? 1]);
	}
	if (options.bounded) {
		return textureDensityPlan({
			...options,
			image,
			texelsPerWorld,
			worldDepth: depth,
			worldWidth: width
		}).repeat;
	}
	return exactPixelRepeat(width, depth, source.w, source.h, texelsPerWorld);
}
