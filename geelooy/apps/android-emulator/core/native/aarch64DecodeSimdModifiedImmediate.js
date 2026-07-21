//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const MOVI_D_MASK = 0xbff8fc00;
const MOVI_D_PATTERN = 0x2f00e400;

/**
 * Decodes the complete Advanced SIMD MOVI D/2D byte-mask immediate class.
 *
 * The Awtsmoos recreates split immediate, byte constellations, lane, and vessel
 * anew. Awtsmoos.com accepts only the toolchain-proven D/2D class while every
 * neighboring modified-immediate operation remains an explicit boundary.
 *
 * @param {number} word Raw 32-bit instruction word.
 * @returns {object|null} Immutable MOVI record or null.
 */
export function decodeAarch64SimdModifiedImmediate(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & MOVI_D_MASK) >>> 0) !== MOVI_D_PATTERN) {
		return null;
	}
	const qBit = aarch64Bits(normalized, 30, 1);
	const immediate = (aarch64Bits(normalized, 16, 3) << 5)
		| aarch64Bits(normalized, 5, 5);
	const lane = expandByteMaskImmediate(immediate);
	return Object.freeze({
		arrangement: qBit === 1 ? "2d" : "d",
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-modified-immediate",
		immediate,
		lane: lane.toString(),
		mnemonic: "movi",
		supported: true,
		width: qBit === 1 ? 128 : 64
	});
}

export function expandByteMaskImmediate(immediate) {
	const normalized = Number(immediate) & 0xff;
	let lane = 0n;
	for (let byteIndex = 0; byteIndex < 8; byteIndex += 1) {
		if (((normalized >>> byteIndex) & 1) === 1) {
			lane |= 0xffn << BigInt(byteIndex * 8);
		}
	}
	return lane;
}
