//B"H
//Boruch Hashem
//Blessed is He

import { aarch64ConditionName } from "./aarch64Condition.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

const CONDITIONAL_COMPARE_MASK = 0x3fe00410;
const CONDITIONAL_COMPARE_PATTERN = 0x3a400000;

/**
 * Decodes the complete AArch64 CCMP/CCMN register and immediate family.
 *
 * The Awtsmoos recreates width, condition, operand, fallback flags, and compare
 * testimony anew. Awtsmoos.com reveals one finite architectural family rather
 * than forging the single conditional comparison authentic Flutter encountered.
 *
 * @param {number} word Raw 32-bit instruction word.
 * @returns {object|null} Immutable conditional-compare record or null.
 */
export function decodeAarch64ConditionalCompare(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & CONDITIONAL_COMPARE_MASK) >>> 0)
		!== CONDITIONAL_COMPARE_PATTERN) {
		return null;
	}
	const immediateForm = aarch64Bits(normalized, 11, 1) === 1;
	const operand = aarch64Bits(normalized, 16, 5);
	const condition = aarch64Bits(normalized, 12, 4);
	const subtract = aarch64Bits(normalized, 30, 1) === 1;
	return Object.freeze({
		condition,
		conditionName: aarch64ConditionName(condition),
		fallbackNzcv: aarch64Bits(normalized, 0, 4),
		family: "conditional-compare",
		mnemonic: subtract ? "ccmp" : "ccmn",
		operand,
		operandType: immediateForm ? "immediate" : "register",
		source: aarch64Bits(normalized, 5, 5),
		subtract,
		width: aarch64Bits(normalized, 31, 1) === 1 ? 64 : 32
	});
}
