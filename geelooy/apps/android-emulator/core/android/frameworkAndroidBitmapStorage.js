//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_BITMAP,
	BITMAP_CONFIG,
	BITMAP_GENERATION,
	BITMAP_MUTABLE,
	BITMAP_PIXELS,
	BITMAP_RECYCLED,
	BITMAP_HEIGHT,
	BITMAP_WIDTH
} from "./frameworkAndroidBitmapTypes.js";

/**
 * Validates Bitmap storage, lifecycle, mutation, and recycle state.
 *
 * The Awtsmoos recreates pixel record, mutable boundary, generation, and recycle
 * shore anew. Awtsmoos.com keeps every transition inside bounded guest fields
 * and never grants access to native graphics memory or browser image objects.
 */
export function androidBitmapRecord(runtime, configRegistry, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== ANDROID_BITMAP) {
		throw bitmapStorageError("ANDROID_BITMAP_TYPE", object.type);
	}
	if (runtime.heap.getField(reference, BITMAP_RECYCLED)) {
		throw bitmapStorageError("ANDROID_BITMAP_RECYCLED", String(reference.id));
	}
	const configReference = runtime.heap.getField(reference, BITMAP_CONFIG);
	const config = configRegistry.record(configReference);
	const width = runtime.heap.getField(reference, BITMAP_WIDTH);
	const height = runtime.heap.getField(reference, BITMAP_HEIGHT);
	const pixels = runtime.heap.getField(reference, BITMAP_PIXELS);
	const expected = width * height * config.bytesPerPixel;
	if (!(pixels instanceof Uint8Array) || pixels.length !== expected) {
		throw bitmapStorageError(
			"ANDROID_BITMAP_STORAGE",
			`${pixels?.length}:${expected}`
		);
	}
	return Object.freeze({
		config,
		configReference,
		height,
		pixels,
		reference,
		width
	});
}

export function assertAndroidBitmapMutable(runtime, record) {
	if (!runtime.heap.getField(record.reference, BITMAP_MUTABLE)
		|| !record.config.mutable) {
		throw bitmapStorageError("ANDROID_BITMAP_IMMUTABLE", record.config.name);
	}
}

export function recycleAndroidBitmap(runtime, reference) {
	if (runtime.heap.getField(reference, BITMAP_RECYCLED)) return false;
	runtime.heap.get(reference);
	runtime.heap.setField(reference, BITMAP_RECYCLED, true);
	runtime.heap.setField(reference, BITMAP_PIXELS, new Uint8Array(0));
	return true;
}

export function touchAndroidBitmap(runtime, reference) {
	const generation = Number(
		runtime.heap.getField(reference, BITMAP_GENERATION) || 0
	);
	const next = (generation + 1) | 0;
	runtime.heap.setField(reference, BITMAP_GENERATION, next);
	return next;
}

export function bitmapField(runtime, reference, key) {
	return runtime.heap.getField(reference, key);
}

export function setBitmapField(runtime, reference, key, value) {
	runtime.heap.setField(reference, key, value);
}

export function isAndroidBitmapRecycled(runtime, reference) {
	runtime.heap.get(reference);
	return Boolean(runtime.heap.getField(reference, BITMAP_RECYCLED));
}

function bitmapStorageError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
