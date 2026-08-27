//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { createAndroidHardwareBuffer } from "./frameworkAndroidHardwareBufferConstruction.js";
import {
	ANDROID_MEDIA_IMAGE,
	ANDROID_MEDIA_PLANE,
	ANDROID_MEDIA_PLANE_ARRAY,
	MEDIA_BYTE_BUFFER,
	MEDIA_CLOSED,
	MEDIA_CROP_RECT,
	MEDIA_FORMAT,
	MEDIA_HARDWARE_BUFFER,
	MEDIA_HEIGHT,
	MEDIA_PIXEL_STRIDE,
	MEDIA_PLANES,
	MEDIA_ROW_STRIDE,
	MEDIA_SCALING_MODE,
	MEDIA_TIMESTAMP,
	MEDIA_TRANSFORM,
	MEDIA_WIDTH
} from "./frameworkAndroidMediaTypes.js";

/**
 * Builds bounded Image, Plane, crop Rect, and genuine Plane-array guest values.
 *
 * The Awtsmoos recreates dimension, plane, crop edge, timestamp, and optional
 * buffer garment anew. Awtsmoos.com keeps construction in Dalvik identity and
 * reveals no host camera frame, native pointer, or browser image.
 */
export function createAndroidMediaImage(runtime, options = {}) {
	const image = runtime.heap.allocate(ANDROID_MEDIA_IMAGE);
	initializeAndroidMediaImage(runtime, image, options);
	return image;
}

export function initializeAndroidMediaImage(runtime, image, options = {}) {
	const width = mediaDimension(options.width ?? 0, "width");
	const height = mediaDimension(options.height ?? 0, "height");
	setFields(runtime, image, {
		[MEDIA_CLOSED]: false,
		[MEDIA_CROP_RECT]: options.cropRect || createCropRect(runtime, width, height),
		[MEDIA_FORMAT]: Number(options.format ?? 0) | 0,
		[MEDIA_HARDWARE_BUFFER]: optionalBuffer(runtime, options, width, height),
		[MEDIA_HEIGHT]: height,
		[MEDIA_PLANES]: createPlaneArray(runtime, options.planes || []),
		[MEDIA_SCALING_MODE]: Number(options.scalingMode ?? 0) | 0,
		[MEDIA_TIMESTAMP]: BigInt(options.timestamp ?? 0),
		[MEDIA_TRANSFORM]: Number(options.transform ?? 0) | 0,
		[MEDIA_WIDTH]: width
	});
}

export function createAndroidMediaPlane(runtime, options = {}) {
	return runtime.heap.allocate(ANDROID_MEDIA_PLANE, {
		[MEDIA_BYTE_BUFFER]: options.buffer || 0,
		[MEDIA_PIXEL_STRIDE]: mediaDimension(options.pixelStride ?? 0, "pixelStride"),
		[MEDIA_ROW_STRIDE]: mediaDimension(options.rowStride ?? 0, "rowStride")
	});
}

function createPlaneArray(runtime, values) {
	const array = runtime.heap.allocateArray(ANDROID_MEDIA_PLANE_ARRAY, values.length);
	values.forEach((value, index) => {
		const plane = isDalvikReference(value)
			? value
			: createAndroidMediaPlane(runtime, value || {});
		runtime.heap.arraySet(array, index, plane);
	});
	return array;
}

function createCropRect(runtime, width, height) {
	return runtime.heap.allocate("Landroid/graphics/Rect;", {
		"Landroid/graphics/Rect;->bottom:I": height,
		"Landroid/graphics/Rect;->left:I": 0,
		"Landroid/graphics/Rect;->right:I": width,
		"Landroid/graphics/Rect;->top:I": 0
	});
}

function optionalBuffer(runtime, options, width, height) {
	if (isDalvikReference(options.hardwareBuffer)) return options.hardwareBuffer;
	if (!options.hardwareBuffer) return 0;
	return createAndroidHardwareBuffer(runtime, {
		format: options.format,
		height,
		layers: 1,
		usage: options.usage,
		width
	});
}

function setFields(runtime, reference, fields) {
	for (const [key, value] of Object.entries(fields)) {
		runtime.heap.setField(reference, key, value);
	}
}

function mediaDimension(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0) {
		const error = new Error(`ANDROID_MEDIA_DIMENSION:${label}:${value}`);
		error.code = "ANDROID_MEDIA_DIMENSION";
		throw error;
	}
	return number;
}
