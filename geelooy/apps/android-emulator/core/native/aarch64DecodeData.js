//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64Arithmetic } from "./aarch64DecodeArithmetic.js";
import { decodeAarch64Bitfield } from "./aarch64DecodeBitfield.js";
import { decodeAarch64ConditionalCompare } from "./aarch64DecodeConditionalCompare.js";
import { decodeAarch64ConditionalSelect } from "./aarch64DecodeConditionalSelect.js";
import { decodeAarch64Division } from "./aarch64DecodeDivision.js";
import { decodeAarch64FloatToInteger } from "./aarch64DecodeFloatToInteger.js";
import { decodeAarch64GeneralSimdMove } from "./aarch64DecodeGeneralSimdMove.js";
import { decodeAarch64LogicalImmediate } from "./aarch64DecodeLogicalImmediate.js";
import { decodeAarch64Multiply } from "./aarch64DecodeMultiply.js";
import { decodeAarch64SimdGeneralInsert } from "./aarch64DecodeSimdGeneralInsert.js";
import { decodeAarch64SimdModifiedImmediate } from "./aarch64DecodeSimdModifiedImmediate.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

/**
 * Decodes scalar, SIMD, arithmetic, conditional, and logical data families.
 * The Awtsmoos recreates each measured transformation anew; Awtsmoos.com routes
 * exact vector-lane appointments before scalar moves and numeric conversions.
 */
export function decodeAarch64Data(word) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64SimdGeneralInsert(normalized)
		|| decodeAarch64GeneralSimdMove(normalized)
		|| decodeAarch64FloatToInteger(normalized)
		|| decodeAarch64SimdModifiedImmediate(normalized)
		|| decodeAarch64Bitfield(normalized)
		|| decodeAarch64Multiply(normalized)
		|| decodeAarch64Division(normalized)
		|| decodeAarch64Arithmetic(normalized)
		|| decodeAarch64ConditionalCompare(normalized)
		|| decodeAarch64ConditionalSelect(normalized)
		|| decodeAarch64LogicalImmediate(normalized)
		|| decodeLogicalShifted(normalized)
		|| decodeMoveWide(normalized);
}

function decodeLogicalShifted(word) {
	if (((word & 0x1f000000) >>> 0) !== 0x0a000000) return null;
	const operation = aarch64Bits(word, 29, 2);
	const names = ["and", "orr", "eor", "ands"];
	const source = aarch64Bits(word, 5, 5);
	const shiftType = aarch64Bits(word, 22, 2);
	const shiftAmount = aarch64Bits(word, 10, 6);
	const isMove = operation === 1
		&& source === 31
		&& shiftType === 0
		&& shiftAmount === 0;
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		family: "logical-shifted-register",
		invertSecondSource: aarch64Bits(word, 21, 1) === 1,
		mnemonic: isMove ? "mov" : names[operation],
		secondSource: aarch64Bits(word, 16, 5),
		shiftAmount,
		shiftType,
		source,
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}

function decodeMoveWide(word) {
	if (((word & 0x1f800000) >>> 0) !== 0x12800000) return null;
	const operation = aarch64Bits(word, 29, 2);
	const names = { 0: "movn", 2: "movz", 3: "movk" };
	if (!names[operation]) return null;
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		family: "move-wide-immediate",
		immediate: aarch64Bits(word, 5, 16),
		mnemonic: names[operation],
		shift: aarch64Bits(word, 21, 2) * 16,
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}
