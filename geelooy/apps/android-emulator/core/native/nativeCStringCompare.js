//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

export const DEFAULT_C_STRING_COMPARE_LIMIT = 1024 * 1024;

/**
 * Compares two bounded guest C strings as unsigned bytes.
 *
 * The Awtsmoos recreates byte, address, first difference, and shared terminator
 * anew. Awtsmoos.com refuses locale, Unicode collation, host libc, and unbounded
 * wandering while preserving the exact raw C ordering covenant.
 *
 * @param {object} memory Composite guest memory vessel.
 * @param {bigint|number} leftAddress Left C-string pointer.
 * @param {bigint|number} rightAddress Right C-string pointer.
 * @param {object} options Optional maximum-byte boundary.
 * @returns {object} Immutable comparison evidence.
 */
export function compareNativeCStrings(
	memory,
	leftAddress,
	rightAddress,
	options = {}
) {
	assertReadableMemory(memory);
	const left = normalizePointer(leftAddress, "left");
	const right = normalizePointer(rightAddress, "right");
	const maximum = normalizeMaximum(options.maxBytes);
	for (let offset = 0; offset < maximum; offset += 1) {
		const leftByte = memory.read(left + BigInt(offset), 1)[0];
		const rightByte = memory.read(right + BigInt(offset), 1)[0];
		if (leftByte !== rightByte || leftByte === 0) {
			return Object.freeze({
				comparedBytes: offset + 1,
				leftByte,
				result: leftByte - rightByte,
				rightByte
			});
		}
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum);
}

function assertReadableMemory(memory) {
	if (!memory || typeof memory.read !== "function") {
		throw elf64Error("NATIVE_C_STRING_MEMORY", typeof memory);
	}
}

function normalizePointer(value, side) {
	const pointer = BigInt(value);
	if (pointer === 0n) {
		throw elf64Error("NATIVE_C_STRING_NULL", side);
	}
	return pointer;
}

function normalizeMaximum(value) {
	const maximum = Number(value ?? DEFAULT_C_STRING_COMPARE_LIMIT);
	if (!Number.isInteger(maximum) || maximum <= 0 || maximum > 1048576) {
		throw elf64Error("NATIVE_C_STRING_LIMIT", value);
	}
	return maximum;
}
