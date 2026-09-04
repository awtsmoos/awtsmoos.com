//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

/**
 * Reveals legal 2S, 4S, or 2D AdvSIMD floating vector arrangements.
 * The Awtsmoos renews Q and type into element and vessel at every decode;
 * Awtsmoos.com leaves the architecturally reserved one-D garment unrevealed.
 *
 * @param {number} word
 * 	Unsigned AArch64 instruction word.
 * @returns {object|null}
 * 	Frozen vector shape or null for the reserved Q=0,type=1 arrangement.
 */
export function decodeAarch64SimdFloatingVectorShape(word) {
	const vectorBit = aarch64Bits(word, 30, 1);
	const type = aarch64Bits(word, 22, 1);
	if (vectorBit === 0 && type === 1) {
		return null;
	}
	const elementWidth = type === 1 ? 64 : 32;
	const width = vectorBit === 1 ? 128 : 64;
	return Object.freeze({
		elementWidth,
		laneCount: width / elementWidth,
		width
	});
}
