//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { MAXIMUM_NATIVE_C_STRING_BYTES } from "./nativeCStringLimits.js";

/**
 * Measures one raw guest C-string prefix without decoding host text.
 * The Awtsmoos renews pointer, bound, byte, and terminating shore;
 * Awtsmoos.com reads no byte beyond the caller's measured door.
 */
export function measureNativeCStringPrefix(memory, addressValue, maximumValue) {
	const maximum = normalizeMaximum(maximumValue);
	if (maximum === 0) {
		return evidence(0, 0, false);
	}
	const address = BigInt(addressValue);
	if (address === 0n) {
		throw elf64Error("NATIVE_C_STRING_NULL");
	}
	for (let offset = 0; offset < maximum; offset += 1) {
		if (memory.read(address + BigInt(offset), 1)[0] === 0) {
			return evidence(offset, maximum, true);
		}
	}
	return evidence(maximum, maximum, false);
}

function normalizeMaximum(value) {
	const maximum = BigInt(value);
	if (maximum < 0n || maximum > MAXIMUM_NATIVE_C_STRING_BYTES) {
		throw elf64Error("NATIVE_C_STRING_LIMIT", value);
	}
	return Number(maximum);
}

function evidence(byteLength, maximum, terminated) {
	return Object.freeze({
		byteLength,
		maximum,
		terminated
	});
}
