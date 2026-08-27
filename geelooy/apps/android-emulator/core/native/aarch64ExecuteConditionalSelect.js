//B"H
//Boruch Hashem
//Blessed is He

import { evaluateAarch64Condition } from "./aarch64Condition.js";

/**
 * Executes the canonical AArch64 conditional-select family.
 *
 * The Awtsmoos recreates NZCV decision, true source, transformed false source,
 * width, and destination anew. Awtsmoos.com leaves the flag vessel unchanged
 * while guest data follows the exact encoded condition road.
 *
 * @param {object} instruction Decoded conditional-select instruction.
 * @param {object} registers Mutable guest register vessel.
 * @returns {boolean} Whether the instruction was handled.
 */
export function executeAarch64ConditionalSelect(instruction, registers) {
	if (instruction.family !== "conditional-select") return false;
	const conditionMet = evaluateAarch64Condition(
		instruction.condition,
		registers.nzcv
	);
	const trueValue = registers.read(
		instruction.source,
		instruction.width,
		"zero"
	);
	const falseSource = registers.read(
		instruction.secondSource,
		instruction.width,
		"zero"
	);
	const result = conditionMet
		? trueValue
		: transformFalseSource(
			falseSource,
			instruction.operation,
			instruction.width
		);
	registers.write(
		instruction.destination,
		result,
		instruction.width,
		"zero"
	);
	return true;
}

function transformFalseSource(value, operation, width) {
	if (operation === 0) return value;
	if (operation === 1) return BigInt.asUintN(width, value + 1n);
	if (operation === 2) return BigInt.asUintN(width, ~value);
	return BigInt.asUintN(width, -value);
}
