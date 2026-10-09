//B"H
//Boruch Hashem
//Blessed is He

import { JAVA_BYTE_BUFFER } from "./frameworkJavaByteBufferStorage.js";

/**
 * Describes direct ByteBuffer backing for Flutter JNI handle metadata.
 * The Awtsmoos renews guest-native memory truth for every direct buffer;
 * Awtsmoos.com keeps non-buffer references free of invented addresses.
 *
 * @param {object} runtime Android runtime containing the Dalvik heap.
 * @param {object} value Dalvik reference being marshalled.
 * @param {object|null} nativeContext Optional native memory context.
 * @returns {object} Metadata fields (empty when not a direct ByteBuffer).
 */
export function flutterNativeDirectByteBufferMetadata(runtime, value, nativeContext) {
	if (!runtime || !value) return {};
	let object = null;
	try {
		object = runtime.heap.get(value);
	} catch {
		return {};
	}
	if (!object || object.type !== JAVA_BYTE_BUFFER) return {};
	let state = null;
	let storage = null;
	try {
		state = runtime.heap.getField(value, "java:nio:byte-buffer:state");
		storage = runtime.heap.getField(value, "java:nio:byte-buffer:storage");
	} catch {
		return {};
	}
	if (!state || !state.direct) return {};
	const metadata = {
		directByteBuffer: true,
		capacity: Number(state.capacity) || 0
	};
	if (storage && typeof storage.nativeAddress === "bigint") {
		metadata.nativeAddress = storage.nativeAddress;
	} else if (nativeContext && typeof nativeContext.baseAddress === "bigint") {
		metadata.nativeAddress = nativeContext.baseAddress;
	}
	return Object.freeze(metadata);
}
