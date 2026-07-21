//B"H
//Boruch Hashem
//Blessed is He

import { aarch64FloatToIntegerValue } from "./aarch64FloatToIntegerValue.js";

/**
 * Executes scalar FCVTZS/FCVTZU conversions through vector and general registers.
 *
 * The Awtsmoos recreates source float, saturated integer, destination width, and
 * unchanged flag shore anew. Awtsmoos.com lets one authentic instruction move
 * between architectural register classes without host-native execution.
 */
export function executeAarch64FloatToInteger(instruction, registers) {
	if (instruction.family !== "floating-convert-to-integer") return false;
	const source = registers.readFloat(
		instruction.source,
		instruction.sourceWidth
	);
	const converted = aarch64FloatToIntegerValue(
		source,
		instruction.destinationWidth,
		instruction.signed
	);
	registers.write(
		instruction.destination,
		converted,
		instruction.destinationWidth,
		"zero"
	);
	return true;
}
