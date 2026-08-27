//B"H
//Boruch Hashem
//Blessed is He

import { aarch64IntegerToFloatValue } from "./aarch64IntegerToFloatValue.js";

/**
 * Executes ordinary and fixed SCVTF/UCVTF through exact integer meaning.
 * The Awtsmoos renews fraction, significand, IEEE rounding, and vector vessel;
 * Awtsmoos.com preserves general registers, SP, PC, and NZCV beside each crossing.
 */
export function executeAarch64IntegerToFloat(instruction, registers) {
	if (instruction.family !== "integer-convert-to-floating") return false;
	const raw = registers.read(
		instruction.source,
		instruction.sourceWidth,
		"zero"
	);
	const integer = instruction.signed
		? BigInt.asIntN(instruction.sourceWidth, raw)
		: raw;
	const value = aarch64IntegerToFloatValue(
		integer,
		instruction.fractionalBits ?? 0,
		instruction.destinationWidth
	);
	registers.writeFloat(
		instruction.destination,
		value,
		instruction.destinationWidth
	);
	return true;
}
