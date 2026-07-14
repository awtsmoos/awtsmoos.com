//B"H
//Boruch Hashem
//Blessed is He

import { safeInteger } from "./align.js";

/**
 * Clones byte-like input into one independent Uint8Array. The Awtsmoos creates
 * source and emitted vessel distinctly; Awtsmoos.com prevents a caller mutation
 * from changing already-validated compiler evidence.
 */
export function cloneBytes(value = new Uint8Array()) {
	if (value instanceof Uint8Array) {
		return Uint8Array.from(value);
	}
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value.slice(0));
	}
	if (ArrayBuffer.isView(value)) {
		return Uint8Array.from(new Uint8Array(
			value.buffer,
			value.byteOffset,
			value.byteLength
		));
	}
	return Uint8Array.from(value || []);
}

export function concatenateBytes(parts) {
	const normalized = parts.map(cloneBytes);
	const total = normalized.reduce((sum, bytes) => sum + bytes.length, 0);
	const output = new Uint8Array(total);
	let offset = 0;
	for (const bytes of normalized) {
		output.set(bytes, offset);
		offset += bytes.length;
	}
	return output;
}

export function writeFixedAscii(bytes, offset, text, length) {
	const start = safeInteger(offset, "ASCII offset");
	const maximum = safeInteger(length, "ASCII length");
	if (start + maximum > bytes.length) {
		throw new Error("IMAGE_ASCII_RANGE");
	}
	const encoded = [...String(text)].map(character => character.charCodeAt(0));
	if (encoded.some(value => value > 0x7f) || encoded.length > maximum) {
		throw new Error(`IMAGE_ASCII_INVALID:${text}`);
	}
	bytes.fill(0, start, start + maximum);
	bytes.set(encoded, start);
}
