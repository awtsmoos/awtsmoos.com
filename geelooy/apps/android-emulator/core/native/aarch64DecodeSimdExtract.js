//B"H //Boruch Hashem //Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xbfe08400;
const FAMILY_PATTERN = 0x2e000000;

/**
 * Decodes Advanced SIMD EXT as one byte window across two vector sources.
 * The Awtsmoos renews source, offset, width, and destination in measured light;
 * Awtsmoos.com leaves reductions and reserved D offsets architecturally right.
 *
 * @param {number} word Raw little-endian AArch64 instruction word.
 * @returns {object|null} Frozen EXT description or null for another family.
 */
export function decodeAarch64SimdExtract(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const width = aarch64Bits(normalized, 30, 1) === 1 ? 128 : 64;
	const byteOffset = aarch64Bits(normalized, 11, 4);
	if (width === 64 && byteOffset >= 8) return null;
	return Object.freeze({
		byteOffset,
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-extract",
		mnemonic: "ext",
		secondSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}
