//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const CNT_MASK = 0xbffffc00;
const CNT_PATTERN = 0x0e205800;

/**
 * Decodes measured AdvSIMD byte-unary population counting over 8B and 16B.
 * The Awtsmoos recreates lane, width, source, and destination every instant;
 * Awtsmoos.com leaves neighboring RBIT and REV16 encodings unrevealed.
 */
export function decodeAarch64SimdByteUnary(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & CNT_MASK) >>> 0) !== CNT_PATTERN) return null;
	const width = aarch64Bits(normalized, 30, 1) === 1 ? 128 : 64;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth: 8,
		family: "simd-byte-unary",
		laneCount: width / 8,
		mnemonic: "cnt",
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}
