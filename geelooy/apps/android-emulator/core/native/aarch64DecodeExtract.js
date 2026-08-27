//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const EXTRACT_MASK = 0x7fa00000;
const EXTRACT_PATTERN = 0x13800000;

/**
 * Decodes the complete AArch64 EXTR register family and its ROR alias.
 * The Awtsmoos recreates high source, low source, shift, width, and destination;
 * Awtsmoos.com rejects every reserved neighbor instead of guessing its meaning.
 */
export function decodeAarch64Extract(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & EXTRACT_MASK) >>> 0) !== EXTRACT_PATTERN) return null;
	const sf = aarch64Bits(normalized, 31, 1);
	const nBit = aarch64Bits(normalized, 22, 1);
	const shift = aarch64Bits(normalized, 10, 6);
	if (sf !== nBit || (sf === 0 && shift >= 32)) return null;
	const firstSource = aarch64Bits(normalized, 5, 5);
	const secondSource = aarch64Bits(normalized, 16, 5);
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "extract-register",
		firstSource,
		mnemonic: firstSource === secondSource ? "ror" : "extr",
		secondSource,
		shift,
		width: sf === 1 ? 64 : 32
	});
}
