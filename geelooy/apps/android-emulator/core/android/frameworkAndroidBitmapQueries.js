//B"H
//Boruch Hashem
//Blessed is He

import { getAndroidBitmapPixel, sameAndroidBitmap } from "./frameworkAndroidBitmapPixels.js";
import {
	androidBitmapRecord,
	bitmapField,
	isAndroidBitmapRecycled
} from "./frameworkAndroidBitmapStorage.js";
import {
	BITMAP_CONFIG,
	BITMAP_DENSITY,
	BITMAP_GENERATION,
	BITMAP_HAS_ALPHA,
	BITMAP_HEIGHT,
	BITMAP_MUTABLE,
	BITMAP_PREMULTIPLIED,
	BITMAP_WIDTH
} from "./frameworkAndroidBitmapTypes.js";

const QUERY_NAMES = new Set([
	"getWidth",
	"getHeight",
	"getConfig",
	"getDensity",
	"getRowBytes",
	"getByteCount",
	"getAllocationByteCount",
	"getGenerationId",
	"hasAlpha",
	"isPremultiplied",
	"isMutable",
	"isRecycled",
	"getPixel",
	"sameAs"
]);

/**
 * Reveals bounded Bitmap dimensions, storage metadata, pixels, and lifecycle.
 *
 * The Awtsmoos recreates query, row byte, generation, color, and comparison
 * anew. Awtsmoos.com reads only validated guest storage and never native or
 * browser graphics state.
 */
export function isAndroidBitmapQuery(name) {
	return QUERY_NAMES.has(name);
}

export function invokeAndroidBitmapQuery(
	runtime,
	configRegistry,
	record,
	args
) {
	const name = record.method.name;
	const bitmap = args[0];
	if (name === "isRecycled") {
		return isAndroidBitmapRecycled(runtime, bitmap) ? 1 : 0;
	}
	const state = androidBitmapRecord(runtime, configRegistry, bitmap);
	if (name === "getWidth") return state.width;
	if (name === "getHeight") return state.height;
	if (name === "getConfig") return bitmapField(runtime, bitmap, BITMAP_CONFIG);
	if (name === "getDensity") return bitmapField(runtime, bitmap, BITMAP_DENSITY);
	if (name === "getRowBytes") return state.width * state.config.bytesPerPixel;
	if (["getByteCount", "getAllocationByteCount"].includes(name)) {
		return state.pixels.length;
	}
	if (name === "getGenerationId") {
		return bitmapField(runtime, bitmap, BITMAP_GENERATION);
	}
	if (name === "hasAlpha") {
		return bitmapField(runtime, bitmap, BITMAP_HAS_ALPHA) ? 1 : 0;
	}
	if (name === "isPremultiplied") {
		return bitmapField(runtime, bitmap, BITMAP_PREMULTIPLIED) ? 1 : 0;
	}
	if (name === "isMutable") {
		return bitmapField(runtime, bitmap, BITMAP_MUTABLE) ? 1 : 0;
	}
	if (name === "getPixel") {
		return getAndroidBitmapPixel(runtime, configRegistry, bitmap, args[1], args[2]);
	}
	if (name === "sameAs") {
		return sameAndroidBitmap(runtime, configRegistry, bitmap, args[1]) ? 1 : 0;
	}
	throw bitmapQueryError(record.signature);
}

function bitmapQueryError(signature) {
	const error = new Error(`ANDROID_BITMAP_QUERY_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_BITMAP_QUERY_UNSUPPORTED";
	return error;
}
