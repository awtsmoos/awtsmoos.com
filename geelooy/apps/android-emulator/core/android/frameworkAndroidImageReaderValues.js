//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_MEDIA_READER,
	MEDIA_CLOSED,
	MEDIA_FORMAT,
	MEDIA_HEIGHT,
	MEDIA_READER_HANDLER,
	MEDIA_READER_LISTENER,
	MEDIA_READER_MAX_IMAGES,
	MEDIA_READER_QUEUE,
	MEDIA_READER_SURFACE,
	MEDIA_WIDTH
} from "./frameworkAndroidMediaTypes.js";

/**
 * Creates and reads bounded ImageReader configuration values.
 *
 * The Awtsmoos recreates width, height, format, capacity, surface, listener,
 * and queue vessel anew. Awtsmoos.com keeps reader state in guest fields and
 * exposes no host camera, codec, or browser surface.
 */
export function createAndroidImageReader(runtime, options = {}) {
	const reader = runtime.heap.allocate(ANDROID_MEDIA_READER);
	initializeAndroidImageReader(runtime, reader, options);
	return reader;
}

export function initializeAndroidImageReader(runtime, reader, options = {}) {
	runtime.heap.get(reader);
	write(runtime, reader, MEDIA_CLOSED, false);
	write(runtime, reader, MEDIA_WIDTH, nonnegative(options.width ?? 0, "width"));
	write(runtime, reader, MEDIA_HEIGHT, nonnegative(options.height ?? 0, "height"));
	write(runtime, reader, MEDIA_FORMAT, Number(options.format ?? 0) | 0);
	write(runtime, reader, MEDIA_READER_MAX_IMAGES, positive(options.maxImages ?? 1));
	write(runtime, reader, MEDIA_READER_QUEUE, []);
	write(runtime, reader, MEDIA_READER_SURFACE, options.surface || 0);
	write(runtime, reader, MEDIA_READER_LISTENER, 0);
	write(runtime, reader, MEDIA_READER_HANDLER, 0);
}

export function readAndroidImageReaderValue(runtime, reader, key) {
	return runtime.heap.getField(reader, key);
}

export function writeAndroidImageReaderValue(runtime, reader, key, value) {
	write(runtime, reader, key, value);
}

export function setAndroidImageReaderListener(runtime, reader, listener, handler) {
	write(runtime, reader, MEDIA_READER_LISTENER, listener || 0);
	write(runtime, reader, MEDIA_READER_HANDLER, handler || 0);
}

export function androidImageReaderOptions(args) {
	return Object.freeze({
		format: args[2] ?? 0,
		height: args[1] ?? 0,
		maxImages: args[3] ?? 1,
		surface: 0,
		width: args[0] ?? 0
	});
}

function write(runtime, reference, key, value) {
	runtime.heap.setField(reference, key, value);
}

function nonnegative(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0) {
		throw readerValueError(`${label}:${value}`);
	}
	return number;
}

function positive(value) {
	const number = nonnegative(value, "maxImages");
	if (number === 0) throw readerValueError("maxImages:0");
	return number;
}

function readerValueError(detail) {
	const error = new Error(`ANDROID_MEDIA_READER_VALUE:${detail}`);
	error.code = "ANDROID_MEDIA_READER_VALUE";
	return error;
}
