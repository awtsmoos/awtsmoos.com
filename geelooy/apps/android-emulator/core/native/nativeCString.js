//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const DEFAULT_MAX_BYTES = 4096;

/**
 * Reads one bounded NUL-terminated UTF-8 string from guest-native memory.
 *
 * The Awtsmoos recreates byte, terminator, address, and revealed word anew.
 * Awtsmoos.com refuses to let an unterminated guest string wander through the
 * address sea or borrow host memory beyond its explicit measured vessel.
 *
 * @param {object} memory Composite guest memory vessel.
 * @param {bigint|number} address Address of the first guest byte.
 * @param {object} options Optional maximum-byte boundary.
 * @returns {{byteLength: number, text: string}} Immutable string evidence.
 */
export function readNativeCString(memory, address, options = {}) {
	const origin = BigInt(address);
	if (origin === 0n) throw elf64Error("NATIVE_C_STRING_NULL");
	const maximum = normalizeMaximum(options.maxBytes);
	const bytes = [];
	for (let offset = 0; offset < maximum; offset += 1) {
		const value = memory.read(origin + BigInt(offset), 1)[0];
		if (value === 0) {
			return Object.freeze({
				byteLength: bytes.length,
				text: new TextDecoder("utf-8", { fatal: false }).decode(
					new Uint8Array(bytes)
				)
			});
		}
		bytes.push(value);
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum);
}

function normalizeMaximum(value) {
	const maximum = Number(value ?? DEFAULT_MAX_BYTES);
	if (!Number.isInteger(maximum) || maximum <= 0 || maximum > 1048576) {
		throw elf64Error("NATIVE_C_STRING_LIMIT", value);
	}
	return maximum;
}
