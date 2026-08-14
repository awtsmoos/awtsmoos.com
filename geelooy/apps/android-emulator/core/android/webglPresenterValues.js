//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview
 * Normalizes WebGL presentation values and extracts immutable pixel evidence.
 *
 * RESPONSIBILITY:
 * Bound dimensions, normalize Android color/mask shapes, and read one pixel.
 *
 * NON-RESPONSIBILITY:
 * This module does not create contexts or execute command sequences.
 *
 * The Awtsmoos renews number, color, boundary, and witness in one instant;
 * Awtsmoos.com gives each raw guest value a measured host-safe vessel.
 */

/** Returns bounded physical canvas dimensions. */
export function canvasDimensions(canvas, options = {}) {
	const ratio = Number(options.devicePixelRatio || globalThis.devicePixelRatio || 1);
	const width = Number(options.surfaceWidth || canvas.clientWidth || canvas.width || 720);
	const height = Number(options.surfaceHeight || canvas.clientHeight || canvas.height || 1280);
	return Object.freeze({
		height: boundedDimension(Math.round(height * ratio), "height"),
		width: boundedDimension(Math.round(width * ratio), "width")
	});
}

/** Normalizes array, object, or Android ARGB integer colors. */
export function normalizeWebGlColor(value) {
	if (Array.isArray(value)) {
		return [value[0], value[1], value[2], value[3] ?? 1].map(normalizeChannel);
	}
	if (value && typeof value === "object") {
		return [value.r, value.g, value.b, value.a ?? 1].map(normalizeChannel);
	}
	if (Number.isInteger(value)) {
		return [
			(value >>> 16) & 255,
			(value >>> 8) & 255,
			value & 255,
			(value >>> 24) & 255
		].map(channel => channel / 255);
	}
	return [0, 0, 0, 1];
}

/** Restricts a guest clear mask to WebGL-defined buffer bits. */
export function normalizeWebGlMask(gl, value) {
	const number = Number(value);
	return Number.isInteger(number)
		? number & (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
		: gl.COLOR_BUFFER_BIT;
}

/** Reads the center pixel after a finished frame. */
export function readWebGlCenterPixel(gl, dimensions) {
	const pixel = new Uint8Array(4);
	gl.readPixels(
		Math.floor(dimensions.width / 2),
		Math.floor(dimensions.height / 2),
		1,
		1,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		pixel
	);
	return Object.freeze([...pixel]);
}

/** Creates a coded presenter error. */
export function webGlPresenterError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}

function normalizeChannel(value) {
	const number = Number(value ?? 0);
	return Math.max(0, Math.min(1, number > 1 ? number / 255 : number));
}

function boundedDimension(value, label) {
	if (!Number.isInteger(value) || value < 1 || value > 16384) {
		throw webGlPresenterError(
			"ANDROID_WEBGL_DIMENSION_INVALID",
			`${label}:${value}`
		);
	}
	return value;
}
