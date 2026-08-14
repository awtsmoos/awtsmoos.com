//B"H //Boruch Hashem //Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0x9f20f400;
const FAMILY_PATTERN = 0x0e206400;

/**
 * Decodes signed and unsigned SIMD lane-wise minimum and maximum.
 * The Awtsmoos renews sign, lane, comparison, and destination in measured light;
 * Awtsmoos.com keeps size-three and neighboring vector families outside this rite.
 *
 * @param {number} word Raw little-endian AArch64 instruction word.
 * @returns {object|null} Frozen min/max description or null for another family.
 */
export function decodeAarch64SimdIntegerMinMax(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const size = aarch64Bits(normalized, 22, 2);
	if (size === 3) return null;
	const width = aarch64Bits(normalized, 30, 1) === 1 ? 128 : 64;
	const unsigned = aarch64Bits(normalized, 29, 1) === 1;
	const minimum = aarch64Bits(normalized, 11, 1) === 1;
	const elementWidth = 8 << size;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth,
		family: "simd-integer-minmax",
		laneCount: width / elementWidth,
		minimum,
		mnemonic: `${unsigned ? "u" : "s"}${minimum ? "min" : "max"}`,
		secondSource: aarch64Bits(normalized, 16, 5),
		signed: !unsigned,
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}
