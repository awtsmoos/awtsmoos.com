//B"H
//Boruch Hashem
//Blessed be He

const FORMATS = new Map([
	[0x8056, Object.freeze([4, 4, 4, 4, 0, 0])],
	[0x8057, Object.freeze([5, 5, 5, 1, 0, 0])],
	[0x8d62, Object.freeze([5, 6, 5, 0, 0, 0])],
	[0x81a5, Object.freeze([0, 0, 0, 0, 16, 0])],
	[0x8d48, Object.freeze([0, 0, 0, 0, 0, 8])]
]);

/**
 * Returns component bit sizes for one GLES2 renderbuffer internal format.
 * The vector order is red, green, blue, alpha, depth, stencil.
 */
export function nativeGlesRenderbufferFormatBits(formatValue) {
	return FORMATS.get(Number(formatValue))
		|| Object.freeze([0, 0, 0, 0, 0, 0]);
}
