//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_BITMAP,
	BITMAP_CONFIG,
	BITMAP_DENSITY,
	BITMAP_GENERATION,
	BITMAP_HAS_ALPHA,
	BITMAP_HEIGHT,
	BITMAP_MUTABLE,
	BITMAP_PIXELS,
	BITMAP_PREMULTIPLIED,
	BITMAP_RECYCLED,
	BITMAP_WIDTH,
	MAXIMUM_BITMAP_BYTES,
	MAXIMUM_BITMAP_PIXELS
} from "./frameworkAndroidBitmapTypes.js";

/**
 * Allocates one bounded Bitmap with independent pure-JavaScript pixel bytes.
 *
 * The Awtsmoos recreates dimensions, config, allocation ceiling, density,
 * generation, and pixel shore anew. Awtsmoos.com never allocates a native
 * graphics object or browser image behind the guest reference.
 */
export function createAndroidBitmap(
	runtime,
	configRegistry,
	widthInput,
	heightInput,
	configReference,
	options = {}
) {
	const width = bitmapDimension(widthInput, "width");
	const height = bitmapDimension(heightInput, "height");
	const config = configRegistry.record(configReference);
	const pixelCount = checkedProduct(
		width,
		height,
		MAXIMUM_BITMAP_PIXELS,
		"pixels"
	);
	const byteCount = checkedProduct(
		pixelCount,
		config.bytesPerPixel,
		MAXIMUM_BITMAP_BYTES,
		"bytes"
	);
	const pixels = options.pixels
		? copyPixelBytes(options.pixels, byteCount)
		: new Uint8Array(byteCount);
	return runtime.heap.allocate(ANDROID_BITMAP, {
		[BITMAP_CONFIG]: configReference,
		[BITMAP_DENSITY]: Number(options.density ?? 160) | 0,
		[BITMAP_GENERATION]: Number(options.generation ?? 1) | 0,
		[BITMAP_HAS_ALPHA]: options.hasAlpha ?? config.alpha,
		[BITMAP_HEIGHT]: height,
		[BITMAP_MUTABLE]: options.mutable ?? config.mutable,
		[BITMAP_PIXELS]: pixels,
		[BITMAP_PREMULTIPLIED]: options.premultiplied ?? true,
		[BITMAP_RECYCLED]: false,
		[BITMAP_WIDTH]: width
	});
}

function bitmapDimension(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0) {
		throw bitmapAllocationError("ANDROID_BITMAP_DIMENSION", `${label}:${value}`);
	}
	return number;
}

function checkedProduct(left, right, maximum, label) {
	const value = left * right;
	if (!Number.isSafeInteger(value) || value > maximum) {
		throw bitmapAllocationError("ANDROID_BITMAP_ALLOCATION", `${label}:${value}`);
	}
	return value;
}

function copyPixelBytes(input, expected) {
	const source = input instanceof Uint8Array ? input : new Uint8Array(input);
	if (source.length !== expected) {
		throw bitmapAllocationError(
			"ANDROID_BITMAP_PIXEL_LENGTH",
			`${source.length}:${expected}`
		);
	}
	return new Uint8Array(source);
}

function bitmapAllocationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
