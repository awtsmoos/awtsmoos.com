// B"H
// Boruch Hashem
// Blessed is He
/** Canonical garments are opened only at trusted execution boundaries. */

import {
	CANONICAL_NUMBER_TAGS,
	CANONICAL_VALUE_TAGS
} from "./canonicalValueTags.js";

function decodeNumber(value) {
	switch (value) {
		case CANONICAL_NUMBER_TAGS.NAN: return Number.NaN;
		case CANONICAL_NUMBER_TAGS.POSITIVE_INFINITY: return Infinity;
		case CANONICAL_NUMBER_TAGS.NEGATIVE_INFINITY: return -Infinity;
		case CANONICAL_NUMBER_TAGS.NEGATIVE_ZERO: return -0;
		default: throw new TypeError(`Unsupported canonical number tag: ${value}`);
	}
}

function bytesFromHex(hex) {
	if (typeof hex !== "string" || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
		throw new TypeError("Canonical binary hex must contain complete hexadecimal bytes.");
	}
	const bytes = new Uint8Array(hex.length / 2);
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
	}
	return bytes;
}

function decodeTypedArray(value) {
	const Constructor = globalThis[value.name];
	if (typeof Constructor !== "function" || !Constructor.BYTES_PER_ELEMENT) {
		throw new TypeError(`Unsupported canonical typed array: ${value.name}`);
	}
	return new Constructor(value.values.map(decodeCanonicalValue));
}

function decodeArray(value) {
	const result = [];
	for (let index = 0; index < value.items.length; index += 1) {
		const item = value.items[index];
		if (item?.type !== CANONICAL_VALUE_TAGS.HOLE) result[index] = decodeCanonicalValue(item);
	}
	result.length = value.items.length;
	return result;
}

export function decodeCanonicalValue(value) {
	if (value === null || typeof value !== "object") return value;
	switch (value.type) {
		case CANONICAL_VALUE_TAGS.NUMBER: return decodeNumber(value.value);
		case CANONICAL_VALUE_TAGS.BIGINT: return BigInt(value.value);
		case CANONICAL_VALUE_TAGS.UNDEFINED: return undefined;
		case CANONICAL_VALUE_TAGS.ARRAY: return decodeArray(value);
		case CANONICAL_VALUE_TAGS.OBJECT: return Object.fromEntries(
			value.entries.map(([key, item]) => [key, decodeCanonicalValue(item)])
		);
		case CANONICAL_VALUE_TAGS.ARRAY_BUFFER: return bytesFromHex(value.hex).buffer;
		case CANONICAL_VALUE_TAGS.DATA_VIEW: return new DataView(bytesFromHex(value.hex).buffer);
		case CANONICAL_VALUE_TAGS.TYPED_ARRAY: return decodeTypedArray(value);
		default: return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, decodeCanonicalValue(item)])
		);
	}
}
