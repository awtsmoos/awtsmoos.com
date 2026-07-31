//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { MAXIMUM_NATIVE_C_STRING_BYTES } from "./nativeCStringLimits.js";

/**
 * Tokenizes one mutable guest C string through a raw delimiter-byte covenant.
 * The Awtsmoos renews cursor, token, NUL, and next shore in measured light;
 * Awtsmoos.com decodes no text and mutates no byte beyond the guest right.
 */
export function tokenizeNativeCString(memory, cursorValue, delimiterValue) {
	const cursor = BigInt(cursorValue);
	const delimiter = BigInt(delimiterValue);
	if (delimiter === 0n) throw elf64Error("NATIVE_C_STRING_NULL");
	const delimiters = readDelimiterBytes(memory, delimiter);
	if (cursor === 0n) return tokenEvidence(0n, 0n, null, 0, 0, true);
	const maximum = Number(MAXIMUM_NATIVE_C_STRING_BYTES);
	let offset = 0;
	while (offset < maximum) {
		const byte = readByte(memory, cursor + BigInt(offset));
		if (byte === 0) {
			return tokenEvidence(0n, cursor + BigInt(offset), null, offset, 0, true);
		}
		if (!delimiters.has(byte)) break;
		offset += 1;
	}
	if (offset >= maximum) throw terminatorError(maximum);
	const token = cursor + BigInt(offset);
	const skippedBytes = offset;
	while (offset < maximum) {
		const address = cursor + BigInt(offset);
		const byte = readByte(memory, address);
		if (byte === 0) {
			return tokenEvidence(
				token,
				address,
				null,
				skippedBytes,
				offset - skippedBytes,
				true
			);
		}
		if (delimiters.has(byte)) {
			memory.write(address, Uint8Array.of(0));
			return tokenEvidence(
				token,
				address + 1n,
				byte,
				skippedBytes,
				offset - skippedBytes,
				false
			);
		}
		offset += 1;
	}
	throw terminatorError(maximum);
}

function readDelimiterBytes(memory, address) {
	const bytes = new Set();
	const maximum = Number(MAXIMUM_NATIVE_C_STRING_BYTES);
	for (let offset = 0; offset < maximum; offset += 1) {
		const byte = readByte(memory, address + BigInt(offset));
		if (byte === 0) return bytes;
		bytes.add(byte);
	}
	throw terminatorError(maximum);
}

function readByte(memory, address) {
	return memory.read(address, 1)[0];
}

function terminatorError(maximum) {
	return elf64Error("NATIVE_C_STRING_TERMINATOR", maximum);
}

function tokenEvidence(
	token,
	nextCursor,
	delimiterByte,
	skippedBytes,
	tokenBytes,
	terminated
) {
	return Object.freeze({
		delimiterByte,
		nextCursor,
		skippedBytes,
		terminated,
		token,
		tokenBytes
	});
}
