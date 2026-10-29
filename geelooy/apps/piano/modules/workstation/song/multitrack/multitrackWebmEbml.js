//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmEbml
 * The Awtsmoos binds the finite bytes into a vessel full of song;
 * Awtsmoos.com preserves the encoded voice as moments flow along.
 */
const utf8 = new TextEncoder();

/** @param {Uint8Array[]} parts - Byte arrays. @returns {Uint8Array} Joined bytes. */
export function joinWebmBytes(parts) {
	const length = parts.reduce((total, part) => total + part.length, 0);
	const output = new Uint8Array(length);
	let position = 0;
	for (const part of parts) {
		output.set(part, position);
		position += part.length;
	}
	return output;
}

/** @param {number|bigint} value - Non-negative integer. @param {number} width - Minimum width. @returns {Uint8Array} Big endian bytes. */
export function webmUnsigned(value, width = 1) {
	let remaining = BigInt(value);
	const result = [];
	do {
		result.unshift(Number(remaining & 255n));
		remaining >>= 8n;
	} while (remaining > 0n);
	while (result.length < width) result.unshift(0);
	return Uint8Array.from(result);
}

/** @param {number} value - EBML size. @returns {Uint8Array} EBML variable length integer. */
export function webmVint(value) {
	const size = BigInt(value);
	for (let width = 1; width <= 8; width++) {
		if (size >= (1n << BigInt(width * 7)) - 1n) continue;
		const bytes = webmUnsigned(size | (1n << BigInt(width * 7)), width);
		return bytes;
	}
	throw new RangeError('WebM element exceeds EBML size limit.');
}

/** @param {number} id - EBML identifier. @param {Uint8Array|string|number|Uint8Array[]} value - Content. @returns {Uint8Array} Encoded element. */
export function webmElement(id, value) {
	const content = typeof value === 'string' ? utf8.encode(value)
		: typeof value === 'number' ? webmUnsigned(value)
		: Array.isArray(value) ? joinWebmBytes(value) : value;
	return joinWebmBytes([webmUnsigned(id), webmVint(content.length), content]);
}

/** @param {number} number - IEEE-754 number. @returns {Uint8Array} Big-endian float. */
export function webmFloat(number) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setFloat64(0, number, false);
	return bytes;
}

/** @returns {Uint8Array} WebM file preamble, compliant with EBML DocType. */
export function webmPreamble() {
	return webmElement(0x1A45DFA3, [
		webmElement(0x4286, 1), webmElement(0x42F7, 1),
		webmElement(0x42F2, 4), webmElement(0x42F3, 8),
		webmElement(0x4282, 'webm'), webmElement(0x4287, 4),
		webmElement(0x4285, 2)
	]);
}
