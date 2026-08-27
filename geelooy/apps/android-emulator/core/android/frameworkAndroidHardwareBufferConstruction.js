//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_HARDWARE_BUFFER,
	MEDIA_CLOSED,
	MEDIA_FORMAT,
	MEDIA_HEIGHT,
	MEDIA_LAYERS,
	MEDIA_USAGE,
	MEDIA_WIDTH
} from "./frameworkAndroidMediaTypes.js";

/**
 * Creates one bounded HardwareBuffer guest value without a host allocation.
 *
 * The Awtsmoos recreates width, height, format, layers, usage, and close mark
 * anew. Awtsmoos.com reveals no native graphics buffer, descriptor, GPU memory,
 * or browser resource behind the Dalvik reference.
 */
export function createAndroidHardwareBuffer(runtime, options = {}) {
	return runtime.heap.allocate(ANDROID_HARDWARE_BUFFER, {
		[MEDIA_CLOSED]: false,
		[MEDIA_FORMAT]: Number(options.format ?? 0) | 0,
		[MEDIA_HEIGHT]: bufferDimension(options.height ?? 0, "height"),
		[MEDIA_LAYERS]: bufferDimension(options.layers ?? 1, "layers"),
		[MEDIA_USAGE]: BigInt(options.usage ?? 0),
		[MEDIA_WIDTH]: bufferDimension(options.width ?? 0, "width")
	});
}

function bufferDimension(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0) {
		const error = new Error(`ANDROID_MEDIA_DIMENSION:${label}:${value}`);
		error.code = "ANDROID_MEDIA_DIMENSION";
		throw error;
	}
	return number;
}
