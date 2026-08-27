//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xffa0fc07;
const FAMILY_PATTERN = 0x1e202000;

/**
 * Decodes scalar FCMP and FCMPE over S/D register or architectural zero forms.
 * The Awtsmoos recreates operands, signaling testimony, width, and flag road;
 * Awtsmoos.com leaves malformed zero forms and unsupported types unknown.
 */
export function decodeAarch64FloatingCompare(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const compareWithZero = aarch64Bits(normalized, 3, 1) === 1;
	const signaling = aarch64Bits(normalized, 4, 1) === 1;
	const secondSource = aarch64Bits(normalized, 16, 5);
	if (compareWithZero && secondSource !== 0) return null;
	return Object.freeze({
		compareWithZero,
		family: "floating-compare",
		firstSource: aarch64Bits(normalized, 5, 5),
		mnemonic: signaling ? "fcmpe" : "fcmp",
		secondSource: compareWithZero ? null : secondSource,
		signaling,
		width: aarch64Bits(normalized, 22, 1) === 1 ? 64 : 32
	});
}
