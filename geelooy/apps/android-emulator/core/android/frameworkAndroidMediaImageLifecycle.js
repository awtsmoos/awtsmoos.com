//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import {
	MEDIA_CLOSED,
	MEDIA_HARDWARE_BUFFER
} from "./frameworkAndroidMediaTypes.js";

/**
 * Governs Android media-image and HardwareBuffer open or closed lifetimes.
 *
 * The Awtsmoos recreates closure, owned buffer release, idempotence, and refusal
 * anew. Awtsmoos.com keeps lifecycle truth inside guest fields rather than host
 * resources whose existence or destruction the APK could otherwise command.
 */
export function closeAndroidMediaImage(runtime, image) {
	if (runtime.heap.getField(image, MEDIA_CLOSED)) return false;
	runtime.heap.setField(image, MEDIA_CLOSED, true);
	const buffer = runtime.heap.getField(image, MEDIA_HARDWARE_BUFFER);
	if (isDalvikReference(buffer)) closeAndroidHardwareBuffer(runtime, buffer);
	return true;
}

export function closeAndroidHardwareBuffer(runtime, buffer) {
	if (runtime.heap.getField(buffer, MEDIA_CLOSED)) return false;
	runtime.heap.setField(buffer, MEDIA_CLOSED, true);
	return true;
}

export function requireOpenMediaReference(runtime, reference, code) {
	runtime.heap.get(reference);
	if (runtime.heap.getField(reference, MEDIA_CLOSED)) {
		throw mediaLifecycleError(code);
	}
	return reference;
}

export function mediaReferenceClosed(runtime, reference) {
	runtime.heap.get(reference);
	return Boolean(runtime.heap.getField(reference, MEDIA_CLOSED));
}

function mediaLifecycleError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
