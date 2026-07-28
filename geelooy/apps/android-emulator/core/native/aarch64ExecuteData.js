//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Arithmetic } from "./aarch64ExecuteArithmetic.js";
import { executeAarch64Bitfield } from "./aarch64ExecuteBitfield.js";
import { executeAarch64ConditionalCompare } from "./aarch64ExecuteConditionalCompare.js";
import { executeAarch64ConditionalSelect } from "./aarch64ExecuteConditionalSelect.js";
import { executeAarch64Division } from "./aarch64ExecuteDivision.js";
import { executeAarch64FloatToInteger } from "./aarch64ExecuteFloatToInteger.js";
import { executeAarch64GeneralSimdMove } from "./aarch64ExecuteGeneralSimdMove.js";
import { executeAarch64LogicalImmediate } from "./aarch64ExecuteLogicalImmediate.js";
import { executeAarch64LogicalShifted } from "./aarch64ExecuteLogicalShifted.js";
import { executeAarch64MoveWide } from "./aarch64ExecuteMoveWide.js";
import { executeAarch64Multiply } from "./aarch64ExecuteMultiply.js";
import { executeAarch64SimdGeneralInsert } from "./aarch64ExecuteSimdGeneralInsert.js";
import { executeAarch64SimdModifiedImmediate } from "./aarch64ExecuteSimdModifiedImmediate.js";

/**
 * Routes every measured scalar, SIMD, conditional, and logical data executor.
 * The Awtsmoos recreates family and destination anew; Awtsmoos.com appoints exact
 * vector lanes before scalar moves and numeric floating transformations.
 */
export function executeAarch64Data(instruction, registers) {
	return executeAarch64SimdGeneralInsert(instruction, registers)
		|| executeAarch64GeneralSimdMove(instruction, registers)
		|| executeAarch64FloatToInteger(instruction, registers)
		|| executeAarch64SimdModifiedImmediate(instruction, registers)
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
