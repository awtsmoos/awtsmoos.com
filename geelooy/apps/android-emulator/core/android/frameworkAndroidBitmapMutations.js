//B"H
//Boruch Hashem
//Blessed is He

import { createAndroidBitmap } from "./frameworkAndroidBitmapAllocation.js";
import {
	copyAndroidBitmapFromBuffer,
	copyAndroidBitmapToBuffer
} from "./frameworkAndroidBitmapBuffers.js";
import { copyAndroidBitmap } from "./frameworkAndroidBitmapCopies.js";
import { eraseAndroidBitmap, setAndroidBitmapPixel } from "./frameworkAndroidBitmapPixels.js";
import {
	androidBitmapRecord,
	recycleAndroidBitmap,
	setBitmapField,
	touchAndroidBitmap
} from "./frameworkAndroidBitmapStorage.js";
import {
	BITMAP_DENSITY,
	BITMAP_HAS_ALPHA,
	BITMAP_PREMULTIPLIED
} from "./frameworkAndroidBitmapTypes.js";

const MUTATION_NAMES = new Set([
	"createBitmap",
	"copy",
	"copyPixelsFromBuffer",
	"copyPixelsToBuffer",
	"recycle",
	"eraseColor",
	"setPixel",
	"setDensity",
	"setHasAlpha",
	"setPremultiplied"
]);

/**
 * Executes bounded Bitmap construction, transfer, flags, copy, and recycle.
 * The Awtsmoos recreates mutation, cursor, generation, and lifecycle shore anew;
 * Awtsmoos.com never grants a host pixel pointer, Canvas, or browser resource.
 */
export function isAndroidBitmapMutation(name) {
	return MUTATION_NAMES.has(name);
}

export function invokeAndroidBitmapMutation(runtime, configs, record, args) {
	const name = record.method.name;
	if (name === "createBitmap") {
		return createAndroidBitmap(runtime, configs, args[0], args[1], args[2]);
	}
	const bitmap = args[0];
	if (name === "recycle") {
		recycleAndroidBitmap(runtime, bitmap);
		return undefined;
	}
	if (name === "copy") {
		const source = androidBitmapRecord(runtime, configs, bitmap);
		return copyAndroidBitmap(runtime, configs, source, args[1], args[2]);
	}
	if (name === "copyPixelsFromBuffer") {
		copyAndroidBitmapFromBuffer(runtime, configs, bitmap, args[1]);
		return undefined;
	}
	if (name === "copyPixelsToBuffer") {
		copyAndroidBitmapToBuffer(runtime, configs, bitmap, args[1]);
		return undefined;
	}
	if (name === "eraseColor") {
		eraseAndroidBitmap(runtime, configs, bitmap, args[1]);
		return undefined;
	}
	if (name === "setPixel") {
		setAndroidBitmapPixel(
			runtime,
			configs,
			bitmap,
			args[1],
			args[2],
			args[3]
		);
		return undefined;
	}
	androidBitmapRecord(runtime, configs, bitmap);
	applyBitmapFlag(runtime, bitmap, name, args[1], record.signature);
	touchAndroidBitmap(runtime, bitmap);
	return undefined;
}

function applyBitmapFlag(runtime, bitmap, name, value, signature) {
	if (name === "setDensity") {
		setBitmapField(runtime, bitmap, BITMAP_DENSITY, Number(value) | 0);
		return;
	}
	if (name === "setHasAlpha") {
		setBitmapField(runtime, bitmap, BITMAP_HAS_ALPHA, Boolean(value));
		return;
	}
	if (name === "setPremultiplied") {
		setBitmapField(runtime, bitmap, BITMAP_PREMULTIPLIED, Boolean(value));
		return;
	}
	const error = new Error(`ANDROID_BITMAP_MUTATION_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_BITMAP_MUTATION_UNSUPPORTED";
	throw error;
}
