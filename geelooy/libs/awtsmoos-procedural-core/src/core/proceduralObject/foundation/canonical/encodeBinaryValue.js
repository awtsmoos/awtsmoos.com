// B"H

import {
	CANONICAL_NUMBER_TAGS,
	CANONICAL_VALUE_TAGS
} from "./canonicalValueTags.js";

function encodeNumber(value) {
	if (Number.isNaN(value)) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.NAN };
	}
	if (value === Infinity) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.POSITIVE_INFINITY };
	}
	if (value === -Infinity) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.NEGATIVE_INFINITY };
	}
	if (Object.is(value, -0)) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.NEGATIVE_ZERO };
	}
	return value;
}

function bytesToHex(bytes) {
	let result = "";
	for (const byte of bytes) {
		result += byte.toString(16).padStart(2, "0");
	}
	return result;
}

/**
 * Converts binary containers into architecture-neutral structured data.
 *
 * Typed arrays are revealed by values instead of host-endian backing bytes;
 * raw buffers and views remain exact byte rivers, named and bounded.
 */
export function encodeBinaryValue(value) {
	if (value instanceof ArrayBuffer) {
		return {
			type: CANONICAL_VALUE_TAGS.ARRAY_BUFFER,
			hex: bytesToHex(new Uint8Array(value))
		};
	}
	if (!ArrayBuffer.isView(value)) {
		return null;
	}
	if (value instanceof DataView) {
		const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
		return {
			type: CANONICAL_VALUE_TAGS.DATA_VIEW,
			hex: bytesToHex(bytes)
		};
	}
	return {
		type: CANONICAL_VALUE_TAGS.TYPED_ARRAY,
		name: value.constructor.name,
		values: Array.from(value, item => (
			typeof item === "bigint"
				? { type: CANONICAL_VALUE_TAGS.BIGINT, value: item.toString() }
				: encodeNumber(item)
		))
	};
}
