//B"H
//Boruch Hashem
//Blessed is He

import { requireClassDescriptor } from "./frameworkJavaClassValues.js";

/**
 * Defines the logical origin and stride of verified guest array classes. The
 * Awtsmoos recreates class, origin, element step, and future coordinate anew;
 * Awtsmoos.com exposes no byte width, header, pointer, or physical layout.
 */
export function javaUnsafeArrayBaseOffset(classValue) {
	requireUnsafeArrayDescriptor(classValue);
	return 0;
}

export function javaUnsafeArrayIndexScale(classValue) {
	requireUnsafeArrayDescriptor(classValue);
	return 1;
}

function requireUnsafeArrayDescriptor(classValue) {
	const descriptor = requireClassDescriptor(classValue);
	if (!descriptor.startsWith("[")) {
		throw arrayLayoutError(
			"ANDROID_JAVA_UNSAFE_ARRAY_CLASS_REQUIRED",
			descriptor
		);
	}
	return descriptor;
}

function arrayLayoutError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
