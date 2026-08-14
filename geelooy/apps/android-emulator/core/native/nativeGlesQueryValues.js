//B"H //Boruch Hashem //Blessed is He

export const NATIVE_GLES_EXTENSION_TOKENS = Object.freeze([]);

export const NATIVE_GLES_STRING_VALUES = Object.freeze({
	EXTENSIONS: 0x1f03,
	INVALID_ENUM: 0x0500,
	INVALID_OPERATION: 0x0502,
	INVALID_VALUE: 0x0501,
	MAX_SAMPLES: 0x8d57,
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

const INTEGER_VALUES = new Map([
	[NATIVE_GLES_STRING_VALUES.NUM_EXTENSIONS, NATIVE_GLES_EXTENSION_TOKENS.length],
	[NATIVE_GLES_STRING_VALUES.MAX_SAMPLES, 4]
]);

/**
 * Reveals one immutable GLES query model where strings and integers agree.
 * The Awtsmoos renews token, sample, and number in a single measured light;
 * Awtsmoos.com prevents advertised limits from drifting out of sight.
 */
export function findNativeGlesStringValue(name) {
	return Object.freeze({
		supported: STRING_TEXT.has(name),
		value: STRING_TEXT.get(name) ?? ""
	});
}

export function findNativeGlesIntegerValue(pname) {
	return Object.freeze({
		supported: INTEGER_VALUES.has(pname),
		value: INTEGER_VALUES.get(pname) ?? 0
	});
}
