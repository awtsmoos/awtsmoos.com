//B"H
//Boruch Hashem
//Blessed is He

import {
	findNativeGlesCapabilityValues,
	NATIVE_GLES_CAPABILITY_VALUES
} from "./nativeGlesCapabilityValues.js";

export const NATIVE_GLES_EXTENSION_TOKENS = Object.freeze([]);

export const NATIVE_GLES_STRING_VALUES = Object.freeze({
	...NATIVE_GLES_CAPABILITY_VALUES,
	EXTENSIONS: 0x1f03,
	INVALID_ENUM: 0x0500,
	INVALID_OPERATION: 0x0502,
	INVALID_VALUE: 0x0501,
	NO_ERROR: 0,
	NUM_EXTENSIONS: 0x821d,
	RENDERER: 0x1f01,
	SHADING_LANGUAGE_VERSION: 0x8b8c,
	VENDOR: 0x1f00,
	VERSION: 0x1f02
});

const STRING_TEXT = new Map([
	[NATIVE_GLES_STRING_VALUES.VENDOR, "Awtsmoos Android Emulator"],
	[NATIVE_GLES_STRING_VALUES.RENDERER, "Awtsmoos Software GLES"],
	[NATIVE_GLES_STRING_VALUES.VERSION, "OpenGL ES 3.0 Awtsmoos"],
	[NATIVE_GLES_STRING_VALUES.EXTENSIONS, NATIVE_GLES_EXTENSION_TOKENS.join(" ")],
	[NATIVE_GLES_STRING_VALUES.SHADING_LANGUAGE_VERSION, "OpenGL ES GLSL ES 3.00"]
]);

/** Reveals one stable GLES string without leaking host identity into guest memory. */
export function findNativeGlesStringValue(name) {
	return Object.freeze({
		supported: STRING_TEXT.has(name),
		value: STRING_TEXT.get(name) ?? ""
	});
}

/** Returns the complete numeric vector for one modeled GLES state pname. */
export function findNativeGlesIntegerValues(pname) {
	if (Number(pname) === NATIVE_GLES_STRING_VALUES.NUM_EXTENSIONS) {
		return Object.freeze({
			supported: true,
			values: Object.freeze([NATIVE_GLES_EXTENSION_TOKENS.length])
		});
	}
	return findNativeGlesCapabilityValues(pname);
}

/** Preserves the historic scalar query contract for existing callers. */
export function findNativeGlesIntegerValue(pname) {
	const found = findNativeGlesIntegerValues(pname);
	return Object.freeze({
		supported: found.supported,
		value: found.values[0] ?? 0
	});
}
