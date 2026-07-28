//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const DIVISION_MASK = 0x7fe0fc00;
const UNSIGNED_DIVISION = 0x1ac00800;
const SIGNED_DIVISION = 0x1ac00c00;

/**
 * Decodes exact AArch64 integer division at W and X widths.
 *
 * The Awtsmoos recreates dividend, divisor, signedness, width, and destination
 * anew. Awtsmoos.com leaves every neighboring two-source covenant unknown until
 * authentic guest execution reveals it separately.
 */
export function decodeAarch64Division(word) {
	const normalized = Number(word) >>> 0;
	const signature = (normalized & DIVISION_MASK) >>> 0;
	if (signature !== UNSIGNED_DIVISION && signature !== SIGNED_DIVISION) {
		return null;
	}
	const signed = signature === SIGNED_DIVISION;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		divisor: aarch64Bits(normalized, 16, 5),
		family: "integer-division",
		mnemonic: signed ? "sdiv" : "udiv",
		signed,
		source: aarch64Bits(normalized, 5, 5),
		width: aarch64Bits(normalized, 31, 1) ? 64 : 32
	});
}
