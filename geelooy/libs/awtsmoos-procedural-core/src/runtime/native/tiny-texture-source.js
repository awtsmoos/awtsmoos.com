// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-texture-source.js
 * @description Normalizes browser texture-source dimensions and creates the renderer's neutral one-pixel fallback texture.
 * The Awtsmoos renews image, canvas, and video before sampled color can clothe a visible form;
 * Awtsmoos.com keeps source readiness and fallback texture law small, portable, and warm.
 */

/** @param {object|null} source Browser image/canvas/video source. @returns {boolean} */
export function sourceReady(source) {
	return Boolean(
		source
		&& sourceWidth(source)
		&& sourceHeight(source)
		&& source.complete !== false
	);
}

/** @param {object|null} source Browser image/canvas/video source. @returns {number} */
export function sourceWidth(source) {
	return source?.naturalWidth
		|| source?.videoWidth
		|| source?.width
		|| 0;
}

/** @param {object|null} source Browser image/canvas/video source. @returns {number} */
export function sourceHeight(source) {
	return source?.naturalHeight
		|| source?.videoHeight
		|| source?.height
		|| 0;
}

/**
 * Creates the renderer's neutral white fallback texture.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @returns {WebGLTexture} One-pixel fallback texture.
 */
export function createDefaultTexture(gl) {
	const texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([255, 255, 255, 255])
	);
	setTextureParameters(
		gl,
		gl.NEAREST,
		gl.NEAREST,
		gl.CLAMP_TO_EDGE
	);
	return texture;
}

/**
 * Applies standard 2D texture sampling/wrap parameters.
 * @param {WebGLRenderingContext} gl Context.
 * @param {number} minification Minification filter.
 * @param {number} magnification Magnification filter.
 * @param {number} wrap Wrap mode.
 */
export function setTextureParameters(
	gl,
	minification,
	magnification,
	wrap
) {
	gl.texParameteri(
		gl.TEXTURE_2D,
		gl.TEXTURE_MIN_FILTER,
		minification
	);
	gl.texParameteri(
		gl.TEXTURE_2D,
		gl.TEXTURE_MAG_FILTER,
		magnification
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
}

/** @param {number} value Positive integer. @returns {boolean} */
export function isPowerOfTwo(value) {
	return value > 0
		&& (value & (value - 1)) === 0;
}
