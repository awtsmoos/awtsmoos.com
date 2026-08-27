//B"H
//Boruch Hashem
//Blessed is He

import {
	readAndroidBitmapPixelBytes,
	writeAndroidBitmapPixelBytes
} from "./frameworkAndroidBitmapPixelCodec.js";
import {
	androidBitmapRecord,
	assertAndroidBitmapMutable,
	touchAndroidBitmap
} from "./frameworkAndroidBitmapStorage.js";

/**
 * Applies bounded Bitmap coordinate operations and generation updates.
 *
 * The Awtsmoos recreates coordinate, pixel offset, color, mutation, comparison,
 * and generation anew. Awtsmoos.com delegates byte-format truth to one focused
 * codec and never reaches native graphics or browser image memory.
 */
export function getAndroidBitmapPixel(
	runtime,
	configRegistry,
	reference,
	x,
	y
) {
	const record = androidBitmapRecord(runtime, configRegistry, reference);
	return readAndroidBitmapPixelBytes(
		record.config.name,
		record.pixels,
		pixelOffset(record, x, y)
	);
}

export function setAndroidBitmapPixel(
	runtime,
	configRegistry,
	reference,
	x,
	y,
	color
) {
	const record = androidBitmapRecord(runtime, configRegistry, reference);
	assertAndroidBitmapMutable(runtime, record);
	writeAndroidBitmapPixelBytes(
		record.config.name,
		record.pixels,
		pixelOffset(record, x, y),
		color
	);
	touchAndroidBitmap(runtime, reference);
}

export function eraseAndroidBitmap(runtime, configRegistry, reference, color) {
	const record = androidBitmapRecord(runtime, configRegistry, reference);
	assertAndroidBitmapMutable(runtime, record);
	for (let index = 0; index < record.width * record.height; index += 1) {
		writeAndroidBitmapPixelBytes(
			record.config.name,
			record.pixels,
			index * record.config.bytesPerPixel,
			color
		);
	}
	touchAndroidBitmap(runtime, reference);
}

export function sameAndroidBitmap(
	runtime,
	configRegistry,
	leftReference,
	rightReference
) {
	const left = androidBitmapRecord(runtime, configRegistry, leftReference);
	const right = androidBitmapRecord(runtime, configRegistry, rightReference);
	if (left.width !== right.width
		|| left.height !== right.height
		|| left.config.name !== right.config.name
		|| left.pixels.length !== right.pixels.length) {
		return false;
	}
	return left.pixels.every((value, index) => value === right.pixels[index]);
}

function pixelOffset(record, xInput, yInput) {
	const x = Number(xInput);
	const y = Number(yInput);
	if (!Number.isInteger(x)
		|| !Number.isInteger(y)
		|| x < 0
		|| y < 0
		|| x >= record.width
		|| y >= record.height) {
		throw bitmapPixelError(`${x}:${y}:${record.width}:${record.height}`);
	}
	return (y * record.width + x) * record.config.bytesPerPixel;
}

function bitmapPixelError(detail) {
	const error = new Error(`ANDROID_BITMAP_PIXEL_BOUNDS:${detail}`);
	error.code = "ANDROID_BITMAP_PIXEL_BOUNDS";
	return error;
}
