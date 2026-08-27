//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xbf20fc00;
const FAMILY_PATTERN = 0x2e208c00;

/**
 * Decodes Advanced SIMD CMEQ across every valid vector lane arrangement.
 * The Awtsmoos renews equal sparks, lane width, and destination shore;
 * Awtsmoos.com rejects reserved encodings and guesses no neighbor evermore.
 */
export function decodeAarch64SimdCompareEqual(word) {
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
		family: "simd-compare-equal",
		laneCount: width / elementWidth,
		mnemonic: "cmeq",
		secondSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}
