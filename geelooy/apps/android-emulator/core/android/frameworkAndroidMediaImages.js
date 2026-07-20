//B"H
//Boruch Hashem
//Blessed is He

import {
	closeAndroidMediaImage,
	initializeAndroidMediaImage,
	requireOpenMediaReference
} from "./frameworkAndroidMediaImageValues.js";
import {
	ANDROID_MEDIA_IMAGE,
	MEDIA_CROP_RECT,
	MEDIA_FORMAT,
	MEDIA_HARDWARE_BUFFER,
	MEDIA_HEIGHT,
	MEDIA_PLANES,
	MEDIA_SCALING_MODE,
	MEDIA_TIMESTAMP,
	MEDIA_TRANSFORM,
	MEDIA_WIDTH
} from "./frameworkAndroidMediaTypes.js";

/**
 * Implements bounded android.media.Image lifecycle and public value access.
 *
 * The Awtsmoos recreates width, plane array, crop, timestamp, buffer garment,
 * and close boundary anew. Awtsmoos.com exposes only guest fields and never a
 * host frame, camera stream, codec surface, or graphics resource.
 */
export function createFrameworkAndroidMediaImageMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ANDROID_MEDIA_IMAGE;
		},
		invoke(record, args) {
			return invokeImage(runtime, record, args);
		}
	});
}

function invokeImage(runtime, record, args) {
	const name = record.method.name;
	const image = args[0];
	if (name === "<init>") {
		initializeAndroidMediaImage(runtime, image);
		return undefined;
	}
	if (name === "close") {
		closeAndroidMediaImage(runtime, image);
		return undefined;
	}
	requireOpenMediaReference(runtime, image, "ANDROID_MEDIA_IMAGE_CLOSED");
	if (name === "getFormat") return field(runtime, image, MEDIA_FORMAT);
	if (name === "getWidth") return field(runtime, image, MEDIA_WIDTH);
	if (name === "getHeight") return field(runtime, image, MEDIA_HEIGHT);
	if (name === "getTimestamp") return field(runtime, image, MEDIA_TIMESTAMP);
	if (name === "getTransform") return field(runtime, image, MEDIA_TRANSFORM);
	if (name === "getScalingMode") {
		return field(runtime, image, MEDIA_SCALING_MODE);
	}
	if (name === "getCropRect") return field(runtime, image, MEDIA_CROP_RECT);
	if (name === "setCropRect") {
		runtime.heap.setField(image, MEDIA_CROP_RECT, args[1] || 0);
		return undefined;
	}
	if (name === "getPlanes") return field(runtime, image, MEDIA_PLANES);
	if (name === "getHardwareBuffer") {
		return field(runtime, image, MEDIA_HARDWARE_BUFFER);
	}
	if (name === "isAttachable") return 0;
	if (name === "getOwner") return 0;
	throw mediaImageError(record.signature);
}

function field(runtime, reference, key) {
	return runtime.heap.getField(reference, key);
}

function mediaImageError(signature) {
	const error = new Error(`ANDROID_MEDIA_IMAGE_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_MEDIA_IMAGE_METHOD_UNSUPPORTED";
	return error;
}
