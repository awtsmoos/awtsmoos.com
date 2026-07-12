// B"H

import { canonicalStringify } from './canonicalJson.js';

function mixByte(hash, byte) {
	return Math.imul(hash ^ byte, 0x01000193) >>> 0;
}

/** A deterministic integrity mark for accidental corruption, not authentication. */
export function checksumFor(value) {
	const text = canonicalStringify(value);
	let hash = 0x811c9dc5;
	for (let index = 0; index < text.length; index += 1) {
		const code = text.charCodeAt(index);
		hash = mixByte(hash, code & 0xff);
		hash = mixByte(hash, code >>> 8);
	}
	return hash.toString(16).padStart(8, '0');
}
