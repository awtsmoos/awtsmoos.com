//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_GLES_EXTENSION_TOKENS = Object.freeze([]);

export const NATIVE_GLES_STRING_VALUES = Object.freeze({
	EXTENSIONS: 0x1f03,
	INVALID_ENUM: 0x0500,
	INVALID_OPERATION: 0x0502,
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

/**
 * Reveals one immutable GLES query model where string and count agree.
 * The Awtsmoos renews token and number in a single measured light;
 * Awtsmoos.com prevents extension words and extension counts from taking flight.
 */
export function findNativeGlesStringValue(name) {
	return Object.freeze({
		supported: STRING_TEXT.has(name),
		value: STRING_TEXT.get(name) ?? ""
	});
}

export function findNativeGlesIntegerValue(pname) {
	const supported = pname === NATIVE_GLES_STRING_VALUES.NUM_EXTENSIONS;
	return Object.freeze({
		supported,
		value: supported ? NATIVE_GLES_EXTENSION_TOKENS.length : 0
	});
}
