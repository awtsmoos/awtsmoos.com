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
	if (instruction.family === "signed-multiply-add-long"
		|| instruction.family === "unsigned-multiply-add-long") {
		return executeMultiplyLong(instruction, registers);
	}
	return false;
}

function executeMultiplyAdd(instruction, registers) {
	const left = registers.read(instruction.source, instruction.width, "zero");
	const right = registers.read(instruction.secondSource, instruction.width, "zero");
	return writeResult(instruction, registers, left * right);
}

function executeMultiplyLong(instruction, registers) {
	const signedSources = instruction.family === "signed-multiply-add-long";
	const left = wideningSource(registers, instruction.source, signedSources);
	const right = wideningSource(
		registers,
		instruction.secondSource,
		signedSources
	);
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

function wideningSource(registers, index, signedSources) {
	const value = registers.read(index, 32, "zero");
	return signedSources ? BigInt.asIntN(32, value) : value;
}
