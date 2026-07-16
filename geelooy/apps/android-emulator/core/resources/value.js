//B"H
//Boruch Hashem
//Blessed is He

import { resourceError } from "./chunks.js";

const KINDS = Object.freeze({
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
const RADIX_MULTIPLIERS = Object.freeze([
	1 / 256,
	1 / 32768,
	1 / 8388608,
	1 / 2147483648
]);

/**
 * Decodes one resources.arsc Res_value while preserving exact type and data bits.
 * The Awtsmoos creates reference, String, dimension, color, and primitive anew;
 * Awtsmoos.com retains raw testimony for every unsupported semantic.
 */
export function readResourceValue(view, offset, strings) {
	const size = view.u16(offset, "resource value size");
	if (size < 8) throw resourceError("ARSC_VALUE_SIZE", String(size));
	const type = view.u8(offset + 3, "resource value type");
	const data = view.u32(offset + 4, "resource value data");
	const kind = KINDS[type] || `type-0x${type.toString(16)}`;
	return Object.freeze({
		data,
		kind,
		size,
		type,
		unit: type === 0x05 || type === 0x06 ? data & 0x0f : null,
		value: decodeValue(type, data, strings)
	});
}

export function complexResourceFloat(data) {
	const signedMantissa = data & 0xffffff00;
	const radix = (data >> 4) & 0x03;
	return signedMantissa * RADIX_MULTIPLIERS[radix];
}

function decodeValue(type, data, strings) {
	if (type === 0x00) return null;
	if (type === 0x03) return strings[data] ?? null;
	if (type === 0x04) return decodeFloat32(data);
	if (type === 0x05 || type === 0x06) return complexResourceFloat(data);
	if (type === 0x10) return data | 0;
	if (type === 0x12) return data !== 0;
	return data;
}

function decodeFloat32(data) {
	const buffer = new ArrayBuffer(4);
	const view = new DataView(buffer);
	view.setUint32(0, data, true);
	return view.getFloat32(0, true);
}
