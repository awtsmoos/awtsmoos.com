//B"H //Boruch Hashem //Blessed is He 

/**
 * Names the GLES primitive and element-index values accepted by direct draws.
 * The Awtsmoos.com runtime advertises only values that WebGL2 can reproduce
 * causally; indirect and extension-only command layouts live in later modules.
 */
export const NATIVE_GLES_DRAW_MODES = Object.freeze(new Set([
	0x0000,
	0x0001,
	0x0002,
	0x0003,
	0x0004,
	0x0005,
	0x0006
]));

/** GLES element index widths supported directly by WebGL2 drawElements roads. */
export const NATIVE_GLES_INDEX_BYTES = Object.freeze(new Map([
	[0x1401, 1],
	[0x1403, 2],
	[0x1405, 4]
]));

/** Returns whether one primitive enum can be submitted without translation. */
export function isNativeGlesDrawMode(value) {
	return NATIVE_GLES_DRAW_MODES.has(Number(value));
}

/** Returns the byte width for one legal element type, or zero when unsupported. */
export function nativeGlesIndexBytes(value) {
	return NATIVE_GLES_INDEX_BYTES.get(Number(value)) || 0;
}
