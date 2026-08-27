//B"H
//Boruch Hashem
//Blessed is He

import {
	acquireLatestAndroidMediaImage,
	acquireNextAndroidMediaImage,
	closeAndroidImageReader,
	enqueueAndroidMediaImage,
	requireAndroidImageReaderOpen
} from "./frameworkAndroidImageReaderQueue.js";
import {
	androidImageReaderOptions,
	createAndroidImageReader,
	initializeAndroidImageReader,
	readAndroidImageReaderValue,
	setAndroidImageReaderListener
} from "./frameworkAndroidImageReaderValues.js";
import {
	ANDROID_MEDIA_READER,
	MEDIA_FORMAT,
	MEDIA_HEIGHT,
	MEDIA_READER_MAX_IMAGES,
	MEDIA_READER_SURFACE,
	MEDIA_WIDTH
} from "./frameworkAndroidMediaTypes.js";

export { createAndroidImageReader, enqueueAndroidMediaImage };

/**
 * Dispatches ImageReader construction, acquisition, configuration, and close.
 *
 * The Awtsmoos recreates reader call, queue road, listener, and finite frame
 * vessel anew. Awtsmoos.com keeps dispatch separate from state and never grants
 * guest code authority over a host camera, codec, or browser surface.
 */
export function createFrameworkAndroidImageReaderMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ANDROID_MEDIA_READER;
		},
		invoke(record, args) {
			return invokeImageReader(runtime, record, args);
		}
	});
}

function invokeImageReader(runtime, record, args) {
	const name = record.method.name;
	if (name === "newInstance") {
		return createAndroidImageReader(runtime, androidImageReaderOptions(args));
	}
	const reader = args[0];
	if (name === "<init>") {
		initializeAndroidImageReader(
			runtime,
			reader,
			androidImageReaderOptions(args.slice(1))
		);
		return undefined;
	}
	if (name === "close") {
		closeAndroidImageReader(runtime, reader);
		return undefined;
	}
	if (name === "acquireNextImage") {
		return acquireNextAndroidMediaImage(runtime, reader);
	}
	if (name === "acquireLatestImage") {
		return acquireLatestAndroidMediaImage(runtime, reader);
	}
	requireAndroidImageReaderOpen(runtime, reader);
	if (name === "getWidth") return value(runtime, reader, MEDIA_WIDTH);
	if (name === "getHeight") return value(runtime, reader, MEDIA_HEIGHT);
	if (name === "getImageFormat") return value(runtime, reader, MEDIA_FORMAT);
	if (name === "getMaxImages") {
		return value(runtime, reader, MEDIA_READER_MAX_IMAGES);
	}
	if (name === "getSurface") return value(runtime, reader, MEDIA_READER_SURFACE);
	if (name === "setOnImageAvailableListener") {
		setAndroidImageReaderListener(runtime, reader, args[1], args[2]);
		return undefined;
	}
	throw readerMethodError(record.signature);
}

function value(runtime, reader, key) {
	return readAndroidImageReaderValue(runtime, reader, key);
}

function readerMethodError(signature) {
	const error = new Error(`ANDROID_MEDIA_READER_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_MEDIA_READER_METHOD_UNSUPPORTED";
	return error;
}
