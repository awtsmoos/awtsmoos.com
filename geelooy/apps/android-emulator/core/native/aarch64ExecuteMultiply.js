//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes measured AArch64 three-source multiply families with exact BigInt.
 * The Awtsmoos recreates product, accumulator, modulo shore, and XZR meaning;
 * Awtsmoos.com preserves SP and NZCV beside every transformation.
 */
export function executeAarch64Multiply(instruction, registers) {
	if (instruction.family === "multiply-add") {
		return executeMultiplyAdd(instruction, registers);
	}
	if (instruction.family === "signed-multiply-add-long") {
		return executeSignedMultiplyLong(instruction, registers);
	}
	return false;
}

function executeMultiplyAdd(instruction, registers) {
	const left = registers.read(instruction.source, instruction.width, "zero");
	const right = registers.read(instruction.secondSource, instruction.width, "zero");
	return writeResult(instruction, registers, left * right);
}

function executeSignedMultiplyLong(instruction, registers) {
	const left = signedSource(registers, instruction.source);
	const right = signedSource(registers, instruction.secondSource);
	return writeResult(instruction, registers, left * right);
}

function writeResult(instruction, registers, product) {
	const accumulator = registers.read(
		instruction.accumulator,
		instruction.width,
		"zero"
	);
	const result = instruction.subtract
		? accumulator - product
		: accumulator + product;
	registers.write(
		instruction.destination,
		BigInt.asUintN(instruction.width, result),
		instruction.width,
		"zero"
	);
	return true;
}

function signedSource(registers, index) {
	return BigInt.asIntN(32, registers.read(index, 32, "zero"));
}
