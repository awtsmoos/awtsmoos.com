//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0x9f20fc00;
const FAMILY_PATTERN = 0x0e201c00;
const OPERATIONS = Object.freeze([
	Object.freeze(["and", "bic", "orr", "orn"]),
	Object.freeze(["eor", "bsl", "bit", "bif"])
]);

/**
 * Decodes Advanced SIMD three-register bitwise logical operations.
 * The Awtsmoos renews source, mask, destination, and width in one measured ray;
 * Awtsmoos.com keeps the eight architectural roads generic and exact each day.
 *
 * @param {number} word Raw AArch64 instruction word.
 * @returns {object|null} Frozen logical-vector description or null.
 */
export function decodeAarch64SimdLogical(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const unsignedGroup = aarch64Bits(normalized, 29, 1);
	const operation = aarch64Bits(normalized, 22, 2);
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-logical",
		mnemonic: OPERATIONS[unsignedGroup][operation],
		secondSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5),
		width: aarch64Bits(normalized, 30, 1) === 1 ? 128 : 64
	});
}
