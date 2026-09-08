//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_GLES_MAX_PIXEL_BYTES = 16 * 1024 * 1024;

export const NATIVE_GLES_TEXTURE_VALUES = Object.freeze({
	BYTE: 0x1400,
	DEPTH_COMPONENT: 0x1902,
	DEPTH_STENCIL: 0x84f9,
	FLOAT: 0x1406,
	HALF_FLOAT: 0x140b,
	INT: 0x1404,
	PACK_ALIGNMENT: 0x0d05,
	RED: 0x1903,
	RED_INTEGER: 0x8d94,
	RG: 0x8227,
	RGB: 0x1907,
	RGBA: 0x1908,
	RGBA_INTEGER: 0x8d99,
	RGB_INTEGER: 0x8d98,
	RG_INTEGER: 0x8228,
	SHORT: 0x1402,
	UNPACK_ALIGNMENT: 0x0cf5,
	UNPACK_ROW_LENGTH: 0x0cf2,
	UNPACK_SKIP_PIXELS: 0x0cf4,
	UNPACK_SKIP_ROWS: 0x0cf3,
	UNSIGNED_BYTE: 0x1401,
	UNSIGNED_INT: 0x1405,
	UNSIGNED_INT_2_10_10_10_REV: 0x8368,
	UNSIGNED_INT_24_8: 0x84fa,
	UNSIGNED_SHORT: 0x1403,
	UNSIGNED_SHORT_4_4_4_4: 0x8033,
	UNSIGNED_SHORT_5_5_5_1: 0x8034,
	UNSIGNED_SHORT_5_6_5: 0x8363
});

const V = NATIVE_GLES_TEXTURE_VALUES;
const COMPONENTS = new Map([
	[V.DEPTH_COMPONENT, 1], [V.DEPTH_STENCIL, 1], [V.RED, 1], [V.RED_INTEGER, 1],
	[V.RG, 2], [V.RG_INTEGER, 2], [V.RGB, 3], [V.RGB_INTEGER, 3],
	[V.RGBA, 4], [V.RGBA_INTEGER, 4]
]);
const SCALAR_BYTES = new Map([
	[V.BYTE, 1], [V.UNSIGNED_BYTE, 1], [V.SHORT, 2], [V.UNSIGNED_SHORT, 2],
	[V.HALF_FLOAT, 2], [V.INT, 4], [V.UNSIGNED_INT, 4], [V.FLOAT, 4]
]);
const PACKED_BYTES = new Map([
	[V.UNSIGNED_SHORT_4_4_4_4, 2], [V.UNSIGNED_SHORT_5_5_5_1, 2],
	[V.UNSIGNED_SHORT_5_6_5, 2], [V.UNSIGNED_INT_2_10_10_10_REV, 4],
	[V.UNSIGNED_INT_24_8, 4]
]);

/** Returns bytes per guest pixel for supported GLES format/type layouts. */
export function nativeGlesPixelSize(formatValue, typeValue) {
	const type = Number(typeValue);
	if (PACKED_BYTES.has(type)) return PACKED_BYTES.get(type);
	const components = COMPONENTS.get(Number(formatValue));
	const bytes = SCALAR_BYTES.get(type);
	return components && bytes ? components * bytes : null;
}

export function nativeGlesDefaultPixelLayout() {
	return { packAlignment: 4, unpackAlignment: 4, unpackRowLength: 0, unpackSkipPixels: 0, unpackSkipRows: 0 };
}
