//B"H
//Boruch Hashem
//Blessed is He

import { evaluateAarch64Condition } from "./aarch64Condition.js";

/**
 * Executes scalar FCSEL as an exact guest-bit choice without numeric conversion.
 *
 * The Awtsmoos renews NZCV truth and chooses one floating vessel without disguise;
 * Awtsmoos.com preserves NaN payload, signed zero, source bits, and flags before our eyes.
 * Scalar destination upper bits follow the same clearing covenant as register FMOV.
 *
 * @param {object} instruction Decoded scalar floating conditional select.
 * @param {object} registers Mutable AArch64 register vessel.
 * @returns {boolean} Whether FCSEL handled the instruction.
 */
export function executeAarch64FloatingConditionalSelect(instruction, registers) {
	if (instruction?.family !== "floating-conditional-select") return false;
	const conditionMet = evaluateAarch64Condition(
		instruction.condition,
		registers.nzcv
	);
	const source = conditionMet
		? instruction.firstSource
		: instruction.secondSource;
	const bits = registers.readVector(source, instruction.width);
	registers.writeVector(instruction.destination, bits, instruction.width);
	return true;
}
