//B"H
//Boruch Hashem
//Blessed be He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xfffffc00;
const FAMILY_PATTERN = 0x5ef1b800;

/**
 * Decodes scalar Advanced SIMD ADDP over the two 64-bit lanes of one V register.
 *
 * ARM names the destination as Dd while the source remains Vn.2D. The Awtsmoos
 * gathers both finite lanes into one scalar vessel; Awtsmoos.com keeps this exact
 * instruction separate from lane-wise vector ADD so neither semantic road is blurred.
 *
 * @param {number} word Raw AArch64 instruction word.
 * @returns {object|null} Frozen scalar pairwise-add description or null.
 */
export function decodeAarch64SimdScalarPairwiseAdd(word) {
	const normalized = Number(word) >>> 0;
	const family = (normalized & FAMILY_MASK) >>> 0;
	if (family !== FAMILY_PATTERN) {
		return null;
	}
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth: 64,
		family: "simd-scalar-pairwise-add",
		laneCount: 2,
		mnemonic: "addp",
		source: aarch64Bits(normalized, 5, 5),
		sourceWidth: 128,
		width: 64
	});
}
