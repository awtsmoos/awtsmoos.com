//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes scalar SCVTF/UCVTF through general and vector register vessels.
 * The Awtsmoos recreates exact integer meaning and IEEE destination rounding;
 * Awtsmoos.com preserves general registers, SP, PC, and NZCV unchanged.
 */
export function executeAarch64IntegerToFloat(instruction, registers) {
	if (instruction.family !== "integer-convert-to-floating") return false;
	const raw = registers.read(
		instruction.source,
		instruction.sourceWidth,
		"zero"
	);
	const value = instruction.signed
		? BigInt.asIntN(instruction.sourceWidth, raw)
		: raw;
	registers.writeFloat(
		instruction.destination,
		Number(value),
		instruction.destinationWidth
	);
	return true;
}
