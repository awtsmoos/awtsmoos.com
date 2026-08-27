//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Arithmetic } from "./aarch64ExecuteArithmetic.js";
import { executeAarch64Bitfield } from "./aarch64ExecuteBitfield.js";
import { executeAarch64ConditionalCompare } from "./aarch64ExecuteConditionalCompare.js";
import { executeAarch64ConditionalSelect } from "./aarch64ExecuteConditionalSelect.js";
import { executeAarch64Division } from "./aarch64ExecuteDivision.js";
import { executeAarch64Extract } from "./aarch64ExecuteExtract.js";
import { executeAarch64FloatingArithmetic } from "./aarch64ExecuteFloatingArithmetic.js";
import { executeAarch64FloatingCompare } from "./aarch64ExecuteFloatingCompare.js";
import { executeAarch64FloatingConditionalCompare } from "./aarch64ExecuteFloatingConditionalCompare.js";
import { executeAarch64FloatingConvert } from "./aarch64ExecuteFloatingConvert.js";
import { executeAarch64FloatingImmediate } from "./aarch64ExecuteFloatingImmediate.js";
import { executeAarch64FloatingMove } from "./aarch64ExecuteFloatingMove.js";
import { executeAarch64FloatToInteger } from "./aarch64ExecuteFloatToInteger.js";
import { executeAarch64GeneralSimdMove } from "./aarch64ExecuteGeneralSimdMove.js";
import { executeAarch64IntegerToFloat } from "./aarch64ExecuteIntegerToFloat.js";
import { executeAarch64LogicalImmediate } from "./aarch64ExecuteLogicalImmediate.js";
import { executeAarch64LogicalShifted } from "./aarch64ExecuteLogicalShifted.js";
import { executeAarch64MoveWide } from "./aarch64ExecuteMoveWide.js";
import { executeAarch64Multiply } from "./aarch64ExecuteMultiply.js";
import { executeAarch64OneSourceBit } from "./aarch64ExecuteOneSourceBit.js";
import { executeAarch64SimdAddLongReduction } from "./aarch64ExecuteSimdAddLongReduction.js";
import { executeAarch64SimdByteUnary } from "./aarch64ExecuteSimdByteUnary.js";
import { executeAarch64SimdCompareEqual } from "./aarch64ExecuteSimdCompareEqual.js";
import { executeAarch64SimdElementDuplicate } from "./aarch64ExecuteSimdElementDuplicate.js";
import { executeAarch64SimdElementInsert } from "./aarch64ExecuteSimdElementInsert.js";
import { executeAarch64SimdExtract } from "./aarch64ExecuteSimdExtract.js";
import { executeAarch64SimdGeneralDuplicate } from "./aarch64ExecuteSimdGeneralDuplicate.js";
import { executeAarch64SimdGeneralInsert } from "./aarch64ExecuteSimdGeneralInsert.js";
import { executeAarch64SimdGeneralMove } from "./aarch64ExecuteSimdGeneralMove.js";
import { executeAarch64SimdIntegerAdd } from "./aarch64ExecuteSimdIntegerAdd.js";
import { executeAarch64SimdFloatingMinMax } from "./aarch64ExecuteSimdFloatingMinMax.js";
import { executeAarch64SimdIntegerMinMax } from "./aarch64ExecuteSimdIntegerMinMax.js";
import { executeAarch64SimdLogical } from "./aarch64ExecuteSimdLogical.js";
import { executeAarch64SimdModifiedImmediate } from "./aarch64ExecuteSimdModifiedImmediate.js";
import { executeAarch64SimdShiftLong } from "./aarch64ExecuteSimdShiftLong.js";
import { executeAarch64VariableShift } from "./aarch64ExecuteVariableShift.js";

/**
 * Routes every measured scalar, SIMD, conditional, and logical data executor.
 *
 * The Awtsmoos recreates family, lane, width, destination, and source in light;
 * Awtsmoos.com keeps each executor narrow so generic guest behavior stays right.
 * Vector logical truth now joins the measured SIMD paths without disguise.
 *
 * @param {object} instruction decoded AArch64 data instruction
 * @param {object} registers guest AArch64 register vessel
 * @returns {boolean} whether one executor accepted and performed the instruction
 */
export function executeAarch64Data(instruction, registers) {
	return executeAarch64SimdGeneralDuplicate(instruction, registers)
		|| executeAarch64SimdElementDuplicate(instruction, registers)
		|| executeAarch64SimdGeneralInsert(instruction, registers)
		|| executeAarch64SimdElementInsert(instruction, registers)
		|| executeAarch64SimdExtract(instruction, registers)
		|| executeAarch64SimdGeneralMove(instruction, registers)
		|| executeAarch64SimdByteUnary(instruction, registers)
		|| executeAarch64SimdCompareEqual(instruction, registers)
		|| executeAarch64SimdLogical(instruction, registers)
		|| executeAarch64SimdFloatingMinMax(instruction, registers)
		|| executeAarch64SimdIntegerAdd(instruction, registers)
		|| executeAarch64SimdIntegerMinMax(instruction, registers)
		|| executeAarch64SimdAddLongReduction(instruction, registers)
		|| executeAarch64SimdShiftLong(instruction, registers)
		|| executeAarch64GeneralSimdMove(instruction, registers)
		|| executeAarch64FloatToInteger(instruction, registers)
		|| executeAarch64IntegerToFloat(instruction, registers)
		|| executeAarch64FloatingConvert(instruction, registers)
		|| executeAarch64FloatingMove(instruction, registers)
		|| executeAarch64FloatingImmediate(instruction, registers)
		|| executeAarch64FloatingArithmetic(instruction, registers)
		|| executeAarch64FloatingConditionalCompare(instruction, registers)
		|| executeAarch64FloatingCompare(instruction, registers)
		|| executeAarch64SimdModifiedImmediate(instruction, registers)
		|| executeAarch64Extract(instruction, registers)
		|| executeAarch64VariableShift(instruction, registers)
		|| executeAarch64OneSourceBit(instruction, registers)
		|| executeAarch64Bitfield(instruction, registers)
		|| executeAarch64Multiply(instruction, registers)
		|| executeAarch64Division(instruction, registers)
		|| executeAarch64Arithmetic(instruction, registers)
		|| executeAarch64ConditionalCompare(instruction, registers)
		|| executeAarch64ConditionalSelect(instruction, registers)
		|| executeAarch64LogicalImmediate(instruction, registers)
		|| executeAarch64LogicalShifted(instruction, registers)
		|| executeAarch64MoveWide(instruction, registers);
}
