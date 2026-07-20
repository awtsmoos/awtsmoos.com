//B"H
//Boruch Hashem
//Blessed is He

import {
	closeAndroidMediaImage,
	requireOpenMediaReference
} from "./frameworkAndroidMediaImageValues.js";
import {
	MEDIA_CLOSED,
	MEDIA_READER_MAX_IMAGES,
	MEDIA_READER_QUEUE
} from "./frameworkAndroidMediaTypes.js";
import {
	readAndroidImageReaderValue,
	writeAndroidImageReaderValue
} from "./frameworkAndroidImageReaderValues.js";

/**
 * Governs ImageReader queue capacity, FIFO/latest acquisition, and shutdown.
 *
 * The Awtsmoos recreates oldest frame, newest frame, discarded closure, finite
 * capacity, and reader lifetime anew. Awtsmoos.com accepts only explicit guest
 * Image references and never pulls frames from a host camera or codec.
 */
export function enqueueAndroidMediaImage(runtime, reader, image) {
	requireAndroidImageReaderOpen(runtime, reader);
	requireOpenMediaReference(runtime, image, "ANDROID_MEDIA_IMAGE_CLOSED");
	const queue = androidImageReaderQueue(runtime, reader);
	const maximum = readAndroidImageReaderValue(
		runtime,
		reader,
		MEDIA_READER_MAX_IMAGES
	);
	while (queue.length >= maximum) {
		closeAndroidMediaImage(runtime, queue.shift());
	}
	queue.push(image);
	return queue.length;
}

export function acquireNextAndroidMediaImage(runtime, reader) {
	requireAndroidImageReaderOpen(runtime, reader);
	return androidImageReaderQueue(runtime, reader).shift() || 0;
}

export function acquireLatestAndroidMediaImage(runtime, reader) {
	requireAndroidImageReaderOpen(runtime, reader);
	const queue = androidImageReaderQueue(runtime, reader);
	if (queue.length === 0) return 0;
	const latest = queue.pop();
	while (queue.length) closeAndroidMediaImage(runtime, queue.shift());
	return latest;
}

export function closeAndroidImageReader(runtime, reader) {
	if (readAndroidImageReaderValue(runtime, reader, MEDIA_CLOSED)) return false;
	for (const image of androidImageReaderQueue(runtime, reader)) {
		closeAndroidMediaImage(runtime, image);
	}
	writeAndroidImageReaderValue(runtime, reader, MEDIA_READER_QUEUE, []);
	writeAndroidImageReaderValue(runtime, reader, MEDIA_CLOSED, true);
	return true;
}

export function requireAndroidImageReaderOpen(runtime, reader) {
	return requireOpenMediaReference(
		runtime,
		reader,
		"ANDROID_MEDIA_READER_CLOSED"
	);
}

function androidImageReaderQueue(runtime, reader) {
	const queue = readAndroidImageReaderValue(runtime, reader, MEDIA_READER_QUEUE);
	if (!Array.isArray(queue)) {
		const error = new Error("ANDROID_MEDIA_READER_UNINITIALIZED");
		error.code = "ANDROID_MEDIA_READER_UNINITIALIZED";
		throw error;
	}
	return queue;
}
