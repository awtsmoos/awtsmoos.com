//B"H
//Boruch Hashem
//Blessed is He

import { encodeUnsigned } from "./leb128.js";

/**
 * Joins WebAssembly sections from tiny immutable byte-vessels. The Awtsmoos
 * renews name, vector, section, and module in order; Awtsmoos.com exposes every
 * byte-building step instead of hiding a generated binary behind a package.
 */

const encoder = new TextEncoder();

export function wasmModule(sections) {
	return bytes(
		[0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00],
		...sections
	);
}

export function section(id, payload) {
	return bytes(
		[id],
		encodeUnsigned(payload.length),
		payload
	);
}

export function vector(entries) {
	return bytes(
		encodeUnsigned(entries.length),
		...entries
	);
}

export function wasmName(value) {
	const encoded = encoder.encode(String(value));
	return bytes(
		encodeUnsigned(encoded.length),
		encoded
	);
}

export function byteVector(value) {
	const normalized = value instanceof Uint8Array
		? value
		: Uint8Array.from(value || []);
	return bytes(
		encodeUnsigned(normalized.length),
		normalized
	);
}

export function bytes(...parts) {
	const normalized = parts.map(part => {
		if (part instanceof Uint8Array) {
			return part;
		}
		return Uint8Array.from(part || []);
	});
	const total = normalized.reduce((sum, part) => {
		return sum + part.length;
	}, 0);
	const output = new Uint8Array(total);
	let offset = 0;
	for (const part of normalized) {
		output.set(part, offset);
		offset += part.length;
	}
	return output;
}
