// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureRepeat.js
 * @description Converts untouched source pixels and measured surface size into fractional repeats.
 * The Awtsmoos grants every image its original finite dimensions; Awtsmoos.com never stretches
 * that vessel to fit geometry, but repeats or reveals only the exact portion required by world scale.
 */

export const REPEAT_HOOKS = Object.freeze({
	floorTileWorld: 4,
	roadTileWorld: 3.8,
	roofTileWorld: 7,
	surfaceTexelsPerWorld: 96,
	terrainTexelsPerWorld: 48,
	wallTileWorld: 6
});

export function textureSize(image) {
	return Object.freeze({
		h: image?.naturalHeight || image?.videoHeight || image?.height || 0,
		w: image?.naturalWidth || image?.videoWidth || image?.width || 0
	});
}

export function publicUrl(image) {
	return image?.dataset?.url
		|| image?.dataset?.publicUrl
		|| image?.src
		|| null;
}

export function exactRepeat(width, height, tileWorld = 1, minimum = 0, maximum = Infinity) {
	const tile = positive(tileWorld, 1);
	return [
		bounded(Math.abs(Number(width) || 0) / tile, minimum, maximum),
		bounded(Math.abs(Number(height) || 0) / tile, minimum, maximum)
	];
}

export function repeatFromPixels(
	width,
	height,
	image,
	texelsPerWorld = REPEAT_HOOKS.surfaceTexelsPerWorld,
	fallback = [1, 1]
) {
	const source = textureSize(image);
	if (!source.w || !source.h) return [...fallback];
	const density = positive(texelsPerWorld, REPEAT_HOOKS.surfaceTexelsPerWorld);
	return [
		Math.abs(Number(width) || 0) * density / source.w,
		Math.abs(Number(height) || 0) * density / source.h
	];
}

export function materialTexture(color, image, repeat = [1, 1], options = {}) {
	return {
		anisotropy: options.anisotropy ?? 2,
		backfaceCull: Boolean(options.backfaceCull),
		color,
		doubleSided: Boolean(options.doubleSided),
		mapImage: image || null,
		mapRepeat: [...repeat],
		texturePolicy: texturePolicy(image, repeat, options),
		textureUrl: publicUrl(image)
	};
}

export function wallRepeat(width, height, image) {
	return repeatFromPixels(width, height, image);
}

export function floorRepeat(width, depth, image) {
	return repeatFromPixels(width, depth, image);
}

export function roofRepeat(width, slopeLength, image) {
	return repeatFromPixels(width, slopeLength, image);
}

export function roadRepeat(width, length, image) {
	return repeatFromPixels(width, length, image);
}

export function terrainRepeat(size, image) {
	return repeatFromPixels(
		size,
		size,
		image,
		REPEAT_HOOKS.terrainTexelsPerWorld
	);
}

export function mixRepeat(size, image) {
	return terrainRepeat(size, image);
}

function texturePolicy(image, repeat, options) {
	return {
		fullResolution: true,
		hook: options.hook || null,
		nativeTexelDensity: options.nativeTexelDensity !== false,
		oneDrawCall: true,
		originalPixels: textureSize(image),
		projection: options.projection || 'cube-world',
		repeat: [...repeat],
		shaderWrap: 'mirror-pingpong-repeat',
		texelsPerWorld: options.texelsPerWorld || REPEAT_HOOKS.surfaceTexelsPerWorld,
		tileWorld: options.tileWorld || null,
		uvUnitsPerWorld: options.uvUnitsPerWorld || null
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function bounded(value, minimum, maximum) {
	return Math.max(Number(minimum) || 0, Math.min(Number(maximum) || Infinity, value));
}
