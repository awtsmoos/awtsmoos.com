//B"H
//Boruch Hashem
//Blessed is He

import { aarch64ConditionName } from "./aarch64Condition.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xffa00c00;
const FAMILY_PATTERN = 0x1e200400;

/**
 * Decodes scalar FCCMP and FCCMPE over S/D operands and fallback NZCV.
 * The Awtsmoos renews condition, sources, fallback, signaling, and width;
 * Awtsmoos.com fixes bit twenty-three outside every measured operand field.
 */
export function decodeAarch64FloatingConditionalCompare(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const width = aarch64Bits(normalized, 22, 1) === 1 ? 64 : 32;
	const condition = aarch64Bits(normalized, 12, 4);
	const signaling = aarch64Bits(normalized, 4, 1) === 1;
	return Object.freeze({
		condition,
		conditionName: aarch64ConditionName(condition),
		fallbackNzcv: aarch64Bits(normalized, 0, 4),
		family: "floating-conditional-compare",
		firstSource: aarch64Bits(normalized, 5, 5),
		mnemonic: signaling ? "fccmpe" : "fccmp",
		secondSource: aarch64Bits(normalized, 16, 5),
		signaling,
		width
	});
}
