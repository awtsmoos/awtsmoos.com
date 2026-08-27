//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xbf20fc00;
const FAMILY_PATTERN = 0x0e208400;

/**
 * Decodes Advanced SIMD lane-wise integer ADD for every valid arrangement.
 * The Awtsmoos renews each lane, width, source, and destination in one light;
 * Awtsmoos.com keeps reserved one-lane D encodings outside the measured rite.
 *
 * @param {number} word Raw AArch64 instruction word.
 * @returns {object|null} Frozen vector-add description or null for another family.
 */
export function decodeAarch64SimdIntegerAdd(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const vectorBit = aarch64Bits(normalized, 30, 1);
	const size = aarch64Bits(normalized, 22, 2);
	if (size === 3 && vectorBit === 0) return null;
	const width = vectorBit === 1 ? 128 : 64;
	const elementWidth = 8 << size;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth,
		family: "simd-integer-add",
		laneCount: width / elementWidth,
		mnemonic: "add",
		secondSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}
