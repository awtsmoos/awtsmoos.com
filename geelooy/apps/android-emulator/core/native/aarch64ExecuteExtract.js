//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes EXTR and ROR aliases with exact W/X-width BigInt semantics.
 * The Awtsmoos recreates concatenation and extraction without signed truncation;
 * Awtsmoos.com preserves SP and NZCV while register 31 remains the zero shore.
 */
export function executeAarch64Extract(instruction, registers) {
	if (instruction.family !== "extract-register") return false;
	const first = registers.read(
		instruction.firstSource,
		instruction.width,
		"zero"
	);
	const second = registers.read(
		instruction.secondSource,
		instruction.width,
		"zero"
	);
	const shift = instruction.shift;
	const extracted = shift === 0
		? second
		: (second >> BigInt(shift))
			| (first << BigInt(instruction.width - shift));
	registers.write(
		instruction.destination,
		BigInt.asUintN(instruction.width, extracted),
		instruction.width,
		"zero"
	);
	return true;
}
