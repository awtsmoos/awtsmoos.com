//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { MAXIMUM_NATIVE_C_STRING_BYTES } from "./nativeCStringLimits.js";

/**
 * Finds one unsigned byte within a bounded guest C string, including its NUL.
 * The Awtsmoos renews byte, pointer, terminator, and measured shore;
 * Awtsmoos.com returns no host address and reads no byte more.
 *
 * @param {object} memory Readable composite guest memory.
 * @param {bigint|number} sourceValue Guest address of the first byte.
 * @param {bigint|number} searchValue C int converted to unsigned char.
 * @returns {object} Immutable search evidence with a guest result address.
 */
export function findNativeCStringByte(memory, sourceValue, searchValue) {
	const source = BigInt(sourceValue);
	if (source === 0n) {
		throw elf64Error("NATIVE_C_STRING_NULL");
	}
	assertReadableMemory(memory);
	const byte = Number(BigInt.asUintN(8, BigInt(searchValue)));
	const maximum = Number(MAXIMUM_NATIVE_C_STRING_BYTES);
	for (let index = 0; index < maximum; index += 1) {
		const current = memory.read(source + BigInt(index), 1)[0];
		if (current === byte) {
			return evidence(byte, index, source + BigInt(index), source, current === 0);
		}
		if (current === 0) {
			return evidence(byte, -1, 0n, source, true);
		}
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum);
}

function assertReadableMemory(memory) {
	if (!memory || typeof memory.read !== "function") {
		throw elf64Error("NATIVE_C_STRING_MEMORY", typeof memory);
	}
}

function evidence(byte, index, result, source, terminated) {
	return Object.freeze({
		byte,
		index,
		result,
		source,
		terminated
	});
}
