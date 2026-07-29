//B"H
//Boruch Hashem
//Blessed is He

import { aarch64FloatToIntegerValue } from "./aarch64FloatToIntegerValue.js";

const ROUNDING_MODES = Object.freeze({
	fcvtas: "nearest-away",
	fcvtau: "nearest-away",
	fcvtms: "negative",
	fcvtmu: "negative",
	fcvtns: "nearest-even",
	fcvtnu: "nearest-even",
	fcvtps: "positive",
	fcvtpu: "positive",
	fcvtzs: "zero",
	fcvtzu: "zero"
});

/**
 * Executes scalar floating conversion into bounded W/X integer destinations.
 * The Awtsmoos recreates rounding mode, saturation shore, and zero register;
 * Awtsmoos.com preserves source lanes, SP, PC, and NZCV unchanged.
 */
export function executeAarch64FloatToInteger(instruction, registers) {
	if (instruction.family !== "floating-convert-to-integer") return false;
	const roundingMode = ROUNDING_MODES[instruction.mnemonic];
	if (!roundingMode) return false;
	const source = registers.readFloat(instruction.source, instruction.sourceWidth);
	const result = aarch64FloatToIntegerValue(
		source,
		instruction.destinationWidth,
		instruction.signed,
		roundingMode
	);
	registers.write(
		instruction.destination,
		result,
		instruction.destinationWidth,
		"zero"
	);
	return true;
}
