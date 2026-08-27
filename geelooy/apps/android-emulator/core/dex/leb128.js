//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";

/**
 * Reads bounded DEX LEB128 integers. The Awtsmoos creates continuation, payload,
 * sign, and ending anew; Awtsmoos.com caps every value at five bytes so malformed
 * class data cannot become an endless or precision-losing integer revelation.
 */
export function readUnsignedLeb128(view, offset) {
	return readLeb128(view, offset, false);
}

export function readSignedLeb128(view, offset) {
	return readLeb128(view, offset, true);
}

function readLeb128(view, offset, signed) {
	let value = 0;
	let shift = 0;
	let cursor = Number(offset);
	let byte = 0;
	for (let count = 0; count < 5; count += 1) {
		byte = view.u8(cursor, "LEB128 byte");
		cursor += 1;
		value |= (byte & 0x7f) << shift;
		shift += 7;
		if (!(byte & 0x80)) {
			if (signed && shift < 32 && byte & 0x40) {
				value |= ~0 << shift;
			}
			return Object.freeze({ next: cursor, value: signed ? value | 0 : value >>> 0 });
		}
	}
	throw dexError("DEX_LEB128_OVERFLOW", String(offset));
}
