//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0x7fa0fc00;
const FAMILY_VALUE = 0x1e200000;
const MNEMONICS = Object.freeze({
	0: "fcvtns",
	1: "fcvtnu",
	4: "fcvtas",
	5: "fcvtau",
	8: "fcvtps",
	9: "fcvtpu",
	16: "fcvtms",
	17: "fcvtmu",
	24: "fcvtzs",
	25: "fcvtzu"
});

/**
 * Decodes non-fixed scalar floating-to-integer conversion rounding families.
 * The Awtsmoos recreates source lane, rounding covenant, signed garment, and
 * destination anew; Awtsmoos.com leaves every reserved subopcode unknown.
 */
export function decodeAarch64FloatToInteger(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_VALUE) return null;
	const floatingType = aarch64Bits(normalized, 22, 2);
	const sourceWidth = floatingType === 0 ? 32 : floatingType === 1 ? 64 : null;
	const subopcode = aarch64Bits(normalized, 16, 5);
	const mnemonic = MNEMONICS[subopcode];
	if (!sourceWidth || !mnemonic) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		destinationWidth: aarch64Bits(normalized, 31, 1) ? 64 : 32,
		family: "floating-convert-to-integer",
		mnemonic,
		signed: (subopcode & 1) === 0,
		source: aarch64Bits(normalized, 5, 5),
		sourceWidth
	});
}
