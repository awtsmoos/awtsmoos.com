//B"H
//Boruch Hashem
//Blessed is He

import { calculateAarch64Arithmetic } from "./aarch64ArithmeticFlags.js";
import { evaluateAarch64Condition } from "./aarch64Condition.js";

/**
 * Executes CCMP/CCMN by conditionally replacing architectural NZCV testimony.
 *
 * The Awtsmoos recreates present flags, comparison path, arithmetic witness, and
 * encoded fallback anew. Awtsmoos.com changes no data register because this
 * family exists solely to reveal the next condition state.
 *
 * @param {object} instruction Decoded conditional comparison.
 * @param {object} registers Mutable AArch64 register vessel.
 * @returns {boolean} Whether the instruction was handled.
 */
export function executeAarch64ConditionalCompare(instruction, registers) {
	if (instruction.family !== "conditional-compare") {
		return false;
	}
	if (!evaluateAarch64Condition(instruction.condition, registers.nzcv)) {
		registers.nzcv = instruction.fallbackNzcv;
		return true;
	}
	const left = registers.read(instruction.source, instruction.width, "zero");
	const right = instruction.operandType === "immediate"
		? BigInt(instruction.operand)
		: registers.read(instruction.operand, instruction.width, "zero");
	const arithmetic = calculateAarch64Arithmetic(
		left,
		right,
		instruction.subtract,
		instruction.width
	);
	registers.nzcv = arithmetic.nzcv;
	return true;
}
