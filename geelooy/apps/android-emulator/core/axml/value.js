//B"H
//Boruch Hashem
//Blessed is He

const TYPES = Object.freeze({
	0x00: "null",
	0x01: "reference",
	0x02: "attribute",
	0x03: "string",
	0x04: "float",
	0x05: "dimension",
	0x06: "fraction",
	0x10: "integer",
	0x11: "hex",
	0x12: "boolean",
	0x1c: "color-argb8",
	0x1d: "color-rgb8",
	0x1e: "color-argb4",
	0x1f: "color-rgb4"
});

/**
 * Decodes one Android Res_value into typed evidence. The Awtsmoos creates raw
 * bits, resource reference, boolean, number, color, and string anew; Awtsmoos.com
 * retains both interpreted value and original type/data for unsupported semantics.
 */
export function decodeAndroidValue(type, data, strings) {
	const kind = TYPES[type] || `type-0x${type.toString(16)}`;
	let value = data;
	if (type === 0x00) value = null;
	if (type === 0x03) value = strings[data] ?? null;
	if (type === 0x04) value = new DataView(Uint32Array.of(data).buffer).getFloat32(0, true);
	if (type === 0x10) value = data | 0;
	if (type === 0x12) value = data !== 0;
	if ([0x01, 0x02, 0x11, 0x1c, 0x1d, 0x1e, 0x1f].includes(type)) {
		value = `0x${data.toString(16).padStart(8, "0")}`;
	}
	return Object.freeze({ data, kind, type, value });
}
