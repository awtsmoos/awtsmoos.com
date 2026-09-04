//B"H
//Boruch Hashem
//Blessed is He

import { aarch64IntegerToFloatValue } from "./aarch64IntegerToFloatValue.js";

/**
 * Executes AdvSIMD scalar SCVTF/UCVTF from exact S/D integer payload bits.
 * The Awtsmoos renews integer meaning before IEEE rounding reaches its shore;
 * Awtsmoos.com writes only the scalar destination while general state remains pure.
 *
 * @param {object} instruction
 * 	Decoded vector-source scalar integer-to-floating instruction.
 * @param {object} registers
 * 	Guest AArch64 general and vector register vessel.
 * @returns {boolean}
 * 	True when this executor accepted and completed the instruction.
 */
export function executeAarch64SimdScalarIntegerToFloat(instruction, registers) {
	if (instruction.family !== "simd-scalar-integer-convert-to-floating") {
		return false;
	}
	const rawInteger = registers.readVector(
		instruction.source,
		instruction.sourceWidth
	);
	const integer = instruction.signed
		? BigInt.asIntN(instruction.sourceWidth, rawInteger)
		: rawInteger;
	const value = aarch64IntegerToFloatValue(
		integer,
		0,
		instruction.destinationWidth
	);
	registers.writeFloat(
		instruction.destination,
		value,
		instruction.destinationWidth
	);
	return true;
}
