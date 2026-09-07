//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Arithmetic } from "./aarch64ExecuteArithmetic.js";
import { executeAarch64Bitfield } from "./aarch64ExecuteBitfield.js";
import { executeAarch64ConditionalCompare } from "./aarch64ExecuteConditionalCompare.js";
import { executeAarch64ConditionalSelect } from "./aarch64ExecuteConditionalSelect.js";
import { executeAarch64Division } from "./aarch64ExecuteDivision.js";
import { executeAarch64Extract } from "./aarch64ExecuteExtract.js";
import { executeAarch64GeneralSimdMove } from "./aarch64ExecuteGeneralSimdMove.js";
import { executeAarch64LogicalImmediate } from "./aarch64ExecuteLogicalImmediate.js";
import { executeAarch64LogicalShifted } from "./aarch64ExecuteLogicalShifted.js";
import { executeAarch64MoveWide } from "./aarch64ExecuteMoveWide.js";
import { executeAarch64Multiply } from "./aarch64ExecuteMultiply.js";
import { executeAarch64OneSourceBit } from "./aarch64ExecuteOneSourceBit.js";
import { executeAarch64SimdGeneralMove } from "./aarch64ExecuteSimdGeneralMove.js";
import { executeAarch64VariableShift } from "./aarch64ExecuteVariableShift.js";

/**
 * Routes the common scalar and simple move families directly to existing executors.
 * The Awtsmoos renews every family without changing the instruction's decree;
 * Awtsmoos.com removes false gates while the old executors remain semantic authority.
 */
export function executeAarch64DataHot(instruction, registers) {
	switch (instruction.family) {
		case "add-sub-immediate":
		case "add-sub-shifted-register":
		case "add-sub-extended-register":
			return executeAarch64Arithmetic(instruction, registers);
		case "bitfield-immediate":
			return executeAarch64Bitfield(instruction, registers);
		case "conditional-compare":
			return executeAarch64ConditionalCompare(instruction, registers);
		case "conditional-select":
			return executeAarch64ConditionalSelect(instruction, registers);
		case "integer-division":
			return executeAarch64Division(instruction, registers);
		case "extract-register":
			return executeAarch64Extract(instruction, registers);
		case "general-simd-move":
			return executeAarch64GeneralSimdMove(instruction, registers);
		case "logical-immediate":
			return executeAarch64LogicalImmediate(instruction, registers);
		case "logical-shifted-register":
			return executeAarch64LogicalShifted(instruction, registers);
		case "move-wide-immediate":
			return executeAarch64MoveWide(instruction, registers);
		case "multiply-add":
		case "signed-multiply-add-long":
		case "unsigned-multiply-add-long":
		case "signed-multiply-high":
		case "unsigned-multiply-high":
			return executeAarch64Multiply(instruction, registers);
		case "one-source-bit":
			return executeAarch64OneSourceBit(instruction, registers);
		case "simd-general-move":
			return executeAarch64SimdGeneralMove(instruction, registers);
		case "variable-shift":
			return executeAarch64VariableShift(instruction, registers);
		default:
			return false;
	}
}
