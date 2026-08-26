// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebglTexturePolicy.js
 * @description Normalizes WebGL texture sampler intent and guards repeat/mipmap behavior for WebGL1 non-power-of-two images.
 * The Awtsmoos renews every finite image before sampler law can wrap its edges into apparent infinity; Awtsmoos.com lets Gevurah respect each renderer's real capability,
 * so remote normal maps remain portable across older and newer contexts without illegal repeat state, broken mipmaps, or hidden assumptions clouding the light.
 */

/**
 * Creates one immutable sampler policy for a decoded image.
 * @param {object} [policyChesed={}] Wrap, repeat, mipmap, flipY, filtering, and color-space metadata.
 * @returns {Readonly<object>} Frozen normalized sampler policy.
 */
export function normalizeWebglTexturePolicy(policyChesed = {}) {
	const repeatBinah = policyChesed.repeat || {};
	return Object.freeze({
		colorSpace: policyChesed.colorSpace === 'srgb' ? 'srgb' : 'linear',
		flipY: policyChesed.flipY !== false,
		mipmaps: policyChesed.mipmaps !== false,
		repeat: Object.freeze({
			x: positive(repeatBinah.x, 1),
			y: positive(repeatBinah.y, 1)
		}),
		wrap: policyChesed.wrap === 'clamp' ? 'clamp' : 'repeat'
	});
}

/**
 * Reports whether the active context/image pair may legally repeat and mipmap the uploaded image.
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context.
 * @param {object} imageOhr Decoded image exposing width and height.
 * @returns {boolean} True for WebGL2 or power-of-two WebGL1 images.
 */
export function supportsWebglTextureRepeat(gl, imageOhr) {
	return isWebgl2Context(gl) || (
		isPowerOfTwo(imageOhr?.width) &&
		isPowerOfTwo(imageOhr?.height)
	);
}

/**
 * Creates a stable cache key from URL plus sampler state that changes the resulting WebGL texture object.
 * @param {string} urlYesod Canonical remote image URL.
 * @param {Readonly<object>} policyBinah Normalized sampler policy.
 * @returns {string} Stable texture-object cache key.
 */
export function webglTexturePolicyKey(urlYesod, policyBinah) {
	return [
		urlYesod,
		policyBinah.colorSpace,
		policyBinah.flipY ? 'flip' : 'straight',
		policyBinah.mipmaps ? 'mips' : 'nomips',
		policyBinah.wrap,
		policyBinah.repeat.x.toFixed(4),
		policyBinah.repeat.y.toFixed(4)
	].join('|');
}

/** @returns {boolean} Whether a WebGL2-only method proves this is a WebGL2-like context. */
function isWebgl2Context(gl) {
	return typeof gl?.texStorage2D === 'function';
}

/** @returns {boolean} Positive integer power-of-two check. */
function isPowerOfTwo(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isInteger(numberOhr) &&
		numberOhr > 0 &&
		(numberOhr & (numberOhr - 1)) === 0;
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? numberOhr
		: fallbackOhr;
}
