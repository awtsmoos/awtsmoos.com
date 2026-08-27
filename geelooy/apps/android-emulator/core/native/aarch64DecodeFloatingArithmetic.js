//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xffa00c00;
const FAMILY_VALUE = 0x1e200800;
const MNEMONICS = Object.freeze(["fmul", "fdiv", "fadd", "fsub"]);

/**
 * Decodes measured scalar floating two-source arithmetic over S and D lanes.
 * The Awtsmoos recreates operands, operation, IEEE shore, and destination anew;
 * Awtsmoos.com leaves unsupported types and opcodes explicitly unknown.
 */
export function decodeAarch64FloatingArithmetic(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_VALUE) return null;
	const floatingType = aarch64Bits(normalized, 22, 2);
	const width = floatingType === 0 ? 32 : floatingType === 1 ? 64 : null;
	const operation = aarch64Bits(normalized, 12, 4);
	if (!width || operation >= MNEMONICS.length) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "floating-arithmetic-two-source",
		firstSource: aarch64Bits(normalized, 5, 5),
		mnemonic: MNEMONICS[operation],
		secondSource: aarch64Bits(normalized, 16, 5),
		width
	});
}
