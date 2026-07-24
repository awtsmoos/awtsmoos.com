// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureRepeat.js
 * @description Selects integer texture repeats from image pixels, world size, and GPU quality.
 * The Awtsmoos gives every pixel its measured place; Awtsmoos.com preserves native detail without
 * stretching one finite image across a valley or multiplying samples beyond the renderer's vessel.
 */

export const REPEAT_HOOKS = Object.freeze({
	mobileMaxRepeats: 48,
	mobileMaxTexture: 2048,
	surfaceTexelsPerWorld: 96,
	terrainTexelsPerWorld: 56
});

export function textureSize(image) {
	return Object.freeze({
		h: image?.naturalHeight || image?.videoHeight || image?.height || 0,
		w: image?.naturalWidth || image?.videoWidth || image?.width || 0
	});
}

export function publicUrl(image) {
	return image?.dataset?.url || image?.dataset?.publicUrl || image?.src || null;
}

export function textureDensityPlan(options = {}) {
	const source = textureSize(options.image);
	const mobile = Boolean(options.mobile);
	const maxTexture = positive(options.maxTextureSize, mobile ? 2048 : 4096);
	const target = positive(options.texelsPerWorld, REPEAT_HOOKS.surfaceTexelsPerWorld)
		* qualityScale(options.quality, mobile);
	const effective = {
		w: Math.min(source.w || maxTexture, maxTexture),
		h: Math.min(source.h || maxTexture, maxTexture)
	};
	const maximum = positive(options.maximumRepeats, mobile ? REPEAT_HOOKS.mobileMaxRepeats : 128);
	const x = axisPlan(options.worldWidth, effective.w, target, maximum);
	const z = axisPlan(options.worldDepth, effective.h, target, maximum);
	return Object.freeze({
		anisotropy: Math.min(positive(options.maximumAnisotropy, mobile ? 4 : 12), mobile ? 4 : 12),
		effectivePixelsPerWorld: Object.freeze([x.effectiveDensity, z.effectiveDensity]),
		effectiveSource: Object.freeze(effective),
		mobile,
		repeat: Object.freeze([x.repeat, z.repeat]),
		source,
		sourceUtilization: Object.freeze([x.utilization, z.utilization]),
		targetPixelsPerWorld: target,
		tileWorld: Object.freeze([x.tileWorld, z.tileWorld])
	});
}

export function repeatFromPixels(width, depth, image, texelsPerWorld = 96, fallback = [1, 1], options = {}) {
	const source = textureSize(image);
	if (!source.w || !source.h) return [...fallback];
	return [...textureDensityPlan({
		...options,
		image,
		texelsPerWorld,
		worldDepth: depth,
		worldWidth: width
	}).repeat];
}

export function materialTexture(color, image, repeat = [1, 1], options = {}) {
	const plan = options.densityPlan || null;
	return {
		anisotropy: plan?.anisotropy ?? options.anisotropy ?? 2,
		color,
		doubleSided: Boolean(options.doubleSided),
		mapImage: image || null,
		mapRepeat: [...repeat],
		texturePolicy: {
			densityPlan: plan,
			fullResolution: true,
			nativeTexelDensity: true,
			originalPixels: textureSize(image),
			projection: options.projection || 'cube-world',
			repeat: [...repeat],
			shaderWrap: 'mirror-pingpong-repeat'
		},
		textureUrl: publicUrl(image)
	};
}

export const wallRepeat = (w, h, image, options) => repeatFromPixels(w, h, image, 96, [1, 1], options);
export const floorRepeat = wallRepeat;
export const roofRepeat = wallRepeat;
export const roadRepeat = wallRepeat;
export const terrainRepeat = (size, image, options) => repeatFromPixels(size, size, image, 56, [1, 1], options);
export const mixRepeat = terrainRepeat;

function axisPlan(worldValue, pixelsValue, target, maximum) {
	const world = positive(Math.abs(Number(worldValue)), 1);
	const pixels = positive(pixelsValue, target);
	const ideal = world * target / pixels;
	const largestAtEightyFivePercent = Math.floor(ideal / 0.85);
	const repeat = Math.max(1, Math.min(maximum, largestAtEightyFivePercent || Math.ceil(ideal)));
	const effectiveDensity = pixels * repeat / world;
	return {
		effectiveDensity,
		repeat,
		tileWorld: world / repeat,
		utilization: Math.min(1, target / effectiveDensity)
	};
}

function qualityScale(quality, mobile) {
	if (quality === 'low') return 0.72;
	if (quality === 'medium' || mobile) return 0.86;
	return 1;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
