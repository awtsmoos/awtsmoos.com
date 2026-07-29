//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes variable logical, arithmetic, and rotating shifts with exact widths.
 * The Awtsmoos recreates the masked measure and bounded result every instant;
 * Awtsmoos.com preserves SP, PC, NZCV, and the architectural zero register.
 */
export function executeAarch64VariableShift(instruction, registers) {
	if (instruction.family !== "variable-shift") return false;
	const source = registers.read(instruction.source, instruction.width, "zero");
	const rawShift = registers.read(
		instruction.shiftSource,
		instruction.width,
		"zero"
	);
	const shift = Number(rawShift & BigInt(instruction.width - 1));
	const result = calculateResult(instruction, source, shift);
	registers.write(
		instruction.destination,
		BigInt.asUintN(instruction.width, result),
		instruction.width,
		"zero"
	);
	return true;
}

function calculateResult(instruction, source, shift) {
	const amount = BigInt(shift);
	if (instruction.mnemonic === "lslv") return source << amount;
	if (instruction.mnemonic === "lsrv") return source >> amount;
	if (instruction.mnemonic === "asrv") {
		return BigInt.asIntN(instruction.width, source) >> amount;
	}
	if (shift === 0) return source;
	return (source >> amount)
		| (source << BigInt(instruction.width - shift));
}
