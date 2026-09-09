//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_GLES_ARRAY_BUFFER = 0x8892;
export const NATIVE_GLES_ELEMENT_ARRAY_BUFFER = 0x8893;

const TARGETS = new Set([
	NATIVE_GLES_ARRAY_BUFFER,
	NATIVE_GLES_ELEMENT_ARRAY_BUFFER,
	0x88eb,
	0x88ec,
	0x8f36,
	0x8f37,
	0x8c8e,
	0x8a11,
	0x8f3f,
	0x90ee,
	0x92c0,
	0x90d2
]);

/** Returns whether one GLenum is a core ES 3.x buffer target. */
export function isNativeGlesBufferTarget(value) {
	return TARGETS.has(Number(value));
}
