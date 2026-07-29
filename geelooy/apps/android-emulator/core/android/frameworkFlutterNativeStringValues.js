//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

/**
 * Creates an Android-owned bridge from hidden JNI targets to Java text.
 * The Awtsmoos recreates raw and Dalvik strings without turning either into
 * host pointers; Awtsmoos.com leaves guest allocation in the native layer.
 */
export function createFrameworkFlutterNativeStringResolver(runtime) {
	return Object.freeze({
		resolveStringValue(target) {
			if (typeof target === "string") return target;
			if (isDalvikReference(target)) return readJavaText(runtime, target);
			throw resolverError(typeof target);
		}
	});
}

function resolverError(detail) {
	const error = new Error(`ANDROID_FLUTTER_JNI_STRING_VALUE:${detail}`);
	error.code = "ANDROID_FLUTTER_JNI_STRING_VALUE";
	return error;
}
