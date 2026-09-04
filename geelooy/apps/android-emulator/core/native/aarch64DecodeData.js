//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64Arithmetic } from "./aarch64DecodeArithmetic.js";
import { decodeAarch64Bitfield } from "./aarch64DecodeBitfield.js";
import { decodeAarch64ConditionalCompare } from "./aarch64DecodeConditionalCompare.js";
import { decodeAarch64ConditionalSelect } from "./aarch64DecodeConditionalSelect.js";
import { decodeAarch64Division } from "./aarch64DecodeDivision.js";
import { decodeAarch64Extract } from "./aarch64DecodeExtract.js";
import { decodeAarch64FloatingArithmetic } from "./aarch64DecodeFloatingArithmetic.js";
import { decodeAarch64FloatingCompare } from "./aarch64DecodeFloatingCompare.js";
import { decodeAarch64FloatingConditionalCompare } from "./aarch64DecodeFloatingConditionalCompare.js";
import { decodeAarch64FloatingConditionalSelect } from "./aarch64DecodeFloatingConditionalSelect.js";
import { decodeAarch64FloatingConvert } from "./aarch64DecodeFloatingConvert.js";
import { decodeAarch64FloatingImmediate } from "./aarch64DecodeFloatingImmediate.js";
import { decodeAarch64FloatingMove } from "./aarch64DecodeFloatingMove.js";
import { decodeAarch64FloatToInteger } from "./aarch64DecodeFloatToInteger.js";
import { decodeAarch64GeneralSimdMove } from "./aarch64DecodeGeneralSimdMove.js";
import { decodeAarch64IntegerToFloat } from "./aarch64DecodeIntegerToFloat.js";
import { decodeAarch64LogicalImmediate } from "./aarch64DecodeLogicalImmediate.js";
import { decodeAarch64LogicalShifted } from "./aarch64DecodeLogicalShifted.js";
import { decodeAarch64MoveWide } from "./aarch64DecodeMoveWide.js";
import { decodeAarch64Multiply } from "./aarch64DecodeMultiply.js";
import { decodeAarch64OneSourceBit } from "./aarch64DecodeOneSourceBit.js";
import { decodeAarch64SimdAddLongReduction } from "./aarch64DecodeSimdAddLongReduction.js";
import { decodeAarch64SimdByteUnary } from "./aarch64DecodeSimdByteUnary.js";
import { decodeAarch64SimdCompareEqual } from "./aarch64DecodeSimdCompareEqual.js";
import { decodeAarch64SimdElementDuplicate } from "./aarch64DecodeSimdElementDuplicate.js";
import { decodeAarch64SimdElementInsert } from "./aarch64DecodeSimdElementInsert.js";
import { decodeAarch64SimdExtract } from "./aarch64DecodeSimdExtract.js";
import { decodeAarch64SimdFloatToInteger } from "./aarch64DecodeSimdFloatToInteger.js";
import { decodeAarch64SimdFloatingArithmetic } from "./aarch64DecodeSimdFloatingArithmetic.js";
import { decodeAarch64SimdFloatingMinMax } from "./aarch64DecodeSimdFloatingMinMax.js";
import { decodeAarch64SimdFloatingRound } from "./aarch64DecodeSimdFloatingRound.js";
import { decodeAarch64SimdGeneralDuplicate } from "./aarch64DecodeSimdGeneralDuplicate.js";
import { decodeAarch64SimdGeneralInsert } from "./aarch64DecodeSimdGeneralInsert.js";
import { decodeAarch64SimdGeneralMove } from "./aarch64DecodeSimdGeneralMove.js";
import { decodeAarch64SimdIntegerAdd } from "./aarch64DecodeSimdIntegerAdd.js";
import { decodeAarch64SimdIntegerMinMax } from "./aarch64DecodeSimdIntegerMinMax.js";
import { decodeAarch64SimdLogical } from "./aarch64DecodeSimdLogical.js";
import { decodeAarch64SimdModifiedImmediate } from "./aarch64DecodeSimdModifiedImmediate.js";
import { decodeAarch64SimdScalarIntegerToFloat } from "./aarch64DecodeSimdScalarIntegerToFloat.js";
import { decodeAarch64SimdShiftLong } from "./aarch64DecodeSimdShiftLong.js";
import { decodeAarch64SimdVariableShift } from "./aarch64DecodeSimdVariableShift.js";
import { decodeAarch64VariableShift } from "./aarch64DecodeVariableShift.js";

/**
 * Composes narrow AArch64 scalar, SIMD, arithmetic, conversion, and logical decoders.
 * The Awtsmoos recreates each opcode family without mingling vessel with flame;
 * Awtsmoos.com lets authentic Flutter scalar and vector kernels pass by generic name.
 */
export function decodeAarch64Data(word) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64SimdGeneralDuplicate(normalized)
		|| decodeAarch64SimdElementDuplicate(normalized)
		|| decodeAarch64SimdGeneralInsert(normalized)
		|| decodeAarch64SimdElementInsert(normalized)
		|| decodeAarch64SimdExtract(normalized)
		|| decodeAarch64SimdGeneralMove(normalized)
		|| decodeAarch64SimdByteUnary(normalized)
		|| decodeAarch64SimdCompareEqual(normalized)
		|| decodeAarch64SimdLogical(normalized)
		|| decodeAarch64SimdFloatingArithmetic(normalized)
		|| decodeAarch64SimdFloatingMinMax(normalized)
		|| decodeAarch64SimdFloatingRound(normalized)
		|| decodeAarch64SimdFloatToInteger(normalized)
		|| decodeAarch64SimdVariableShift(normalized)
		|| decodeAarch64SimdIntegerAdd(normalized)
		|| decodeAarch64SimdIntegerMinMax(normalized)
		|| decodeAarch64SimdAddLongReduction(normalized)
		|| decodeAarch64SimdShiftLong(normalized)
		|| decodeAarch64SimdScalarIntegerToFloat(normalized)
		|| decodeAarch64GeneralSimdMove(normalized)
		|| decodeAarch64FloatToInteger(normalized)
		|| decodeAarch64IntegerToFloat(normalized)
		|| decodeAarch64FloatingConvert(normalized)
		|| decodeAarch64FloatingMove(normalized)
		|| decodeAarch64FloatingImmediate(normalized)
		|| decodeAarch64FloatingArithmetic(normalized)
		|| decodeAarch64FloatingConditionalSelect(normalized)
		|| decodeAarch64FloatingConditionalCompare(normalized)
		|| decodeAarch64FloatingCompare(normalized)
		|| decodeAarch64SimdModifiedImmediate(normalized)
		|| decodeAarch64Extract(normalized)
		|| decodeAarch64VariableShift(normalized)
		|| decodeAarch64OneSourceBit(normalized)
		|| decodeAarch64Bitfield(normalized)
		|| decodeAarch64Multiply(normalized)
		|| decodeAarch64Division(normalized)
		|| decodeAarch64Arithmetic(normalized)
		|| decodeAarch64ConditionalCompare(normalized)
		|| decodeAarch64ConditionalSelect(normalized)
		|| decodeAarch64LogicalImmediate(normalized)
		|| decodeAarch64LogicalShifted(normalized)
		|| decodeAarch64MoveWide(normalized);
}
