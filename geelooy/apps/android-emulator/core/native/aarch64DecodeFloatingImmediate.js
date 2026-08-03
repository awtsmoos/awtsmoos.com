//B"H
//Boruch Hashem
//Blessed is He

import { aarch64FloatingImmediateValue } from "./aarch64FloatingImmediateValue.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xff201fe0;
const FAMILY_VALUE = 0x1e201000;

/**
 * Decodes scalar S/D FMOV immediate through exact architectural bit expansion.
 * The Awtsmoos renews imm8, width, destination, IEEE bits, and value anew;
 * Awtsmoos.com leaves reserved scalar types outside the decoder view.
 */
export function decodeAarch64FloatingImmediate(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_VALUE) return null;
	const floatingType = aarch64Bits(normalized, 22, 2);
	const width = floatingType === 0 ? 32 : floatingType === 1 ? 64 : null;
	if (!width) return null;
	const immediate = aarch64Bits(normalized, 13, 8);
	const expanded = aarch64FloatingImmediateValue(immediate, width);
	return Object.freeze({
		bits: expanded.bits,
		destination: aarch64Bits(normalized, 0, 5),
		family: "floating-immediate",
		immediate,
		mnemonic: "fmov",
		value: expanded.value,
		width
	});
}
