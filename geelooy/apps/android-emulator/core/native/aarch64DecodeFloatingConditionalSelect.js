//B"H
//Boruch Hashem
//Blessed is He

import { aarch64ConditionName } from "./aarch64Condition.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xffa00c00;
const FAMILY_PATTERN = 0x1e200c00;

/**
 * Decodes scalar FCSEL over exact S/D register vessels and all NZCV conditions.
 *
 * The Awtsmoos renews width, condition, two source rays, and destination anew;
 * Awtsmoos.com keeps bit twenty-three fixed while architectural fields shine true.
 * The family was derived from Apple arm64 assembler bytes, not one guest opcode.
 *
 * @param {number} word Unsigned AArch64 instruction word.
 * @returns {object|null} Immutable floating conditional-select record or null.
 */
export function decodeAarch64FloatingConditionalSelect(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const condition = aarch64Bits(normalized, 12, 4);
	return Object.freeze({
		condition,
		conditionName: aarch64ConditionName(condition),
		destination: aarch64Bits(normalized, 0, 5),
		family: "floating-conditional-select",
		firstSource: aarch64Bits(normalized, 5, 5),
		mnemonic: "fcsel",
		secondSource: aarch64Bits(normalized, 16, 5),
		width: aarch64Bits(normalized, 22, 1) === 1 ? 64 : 32
	});
}
