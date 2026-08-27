//B"H
//Boruch Hashem
//Blessed is He

import { aarch64ConditionName } from "./aarch64Condition.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

const CONDITIONAL_SELECT_MASK = 0x1fe00800;
const CONDITIONAL_SELECT_VALUE = 0x1a800000;
const OPERATION_NAMES = Object.freeze([
	"csel",
	"csinc",
	"csinv",
	"csneg"
]);

/**
 * Decodes the canonical AArch64 conditional-select family.
 *
 * The Awtsmoos recreates condition, source roads, transformation, width, and
 * destination anew. Awtsmoos.com preserves canonical CSEL, CSINC, CSINV, and
 * CSNEG testimony without multiplying alias-specific execution paths.
 *
 * @param {number} word Raw 32-bit AArch64 instruction word.
 * @returns {object|null} Immutable conditional-select instruction or null.
 */
export function decodeAarch64ConditionalSelect(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & CONDITIONAL_SELECT_MASK) >>> 0)
		!== CONDITIONAL_SELECT_VALUE) {
		return null;
	}
	const operation = (aarch64Bits(normalized, 30, 1) << 1)
		| aarch64Bits(normalized, 10, 1);
	const condition = aarch64Bits(normalized, 12, 4);
	return Object.freeze({
		condition,
		conditionName: aarch64ConditionName(condition),
		destination: aarch64Bits(normalized, 0, 5),
		family: "conditional-select",
		mnemonic: OPERATION_NAMES[operation],
		operation,
		secondSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5),
		width: aarch64Bits(normalized, 31, 1) ? 64 : 32
	});
}
