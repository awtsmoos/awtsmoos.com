//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes exact AArch64 multiply-add, widening, and upper-half products.
 * The Awtsmoos recreates product, accumulator, high shore, and XZR meaning;
 * Awtsmoos.com preserves SP and NZCV beside every measured multiplying.
 */
export function executeAarch64Multiply(instruction, registers) {
	if (instruction.family === "multiply-add") {
		return executeMultiplyAdd(instruction, registers);
	}
	if (instruction.family === "signed-multiply-add-long"
		|| instruction.family === "unsigned-multiply-add-long") {
		return executeMultiplyLong(instruction, registers);
	}
	if (instruction.family === "signed-multiply-high"
		|| instruction.family === "unsigned-multiply-high") {
		return executeMultiplyHigh(instruction, registers);
	}
	return false;
}

function executeMultiplyAdd(instruction, registers) {
	const left = registers.read(instruction.source, instruction.width, "zero");
	const right = registers.read(instruction.secondSource, instruction.width, "zero");
	return writeAccumulatedResult(instruction, registers, left * right);
}

function executeMultiplyLong(instruction, registers) {
	const signedSources = instruction.family === "signed-multiply-add-long";
	const left = wideningSource(registers, instruction.source, signedSources);
	const right = wideningSource(registers, instruction.secondSource, signedSources);
	return writeAccumulatedResult(instruction, registers, left * right);
}

function executeMultiplyHigh(instruction, registers) {
	const signedSources = instruction.family === "signed-multiply-high";
	const rawLeft = registers.read(instruction.source, 64, "zero");
	const rawRight = registers.read(instruction.secondSource, 64, "zero");
	const left = signedSources ? BigInt.asIntN(64, rawLeft) : rawLeft;
	const right = signedSources ? BigInt.asIntN(64, rawRight) : rawRight;
	const high = BigInt.asUintN(64, (left * right) >> 64n);
	registers.write(instruction.destination, high, 64, "zero");
	return true;
}

function writeAccumulatedResult(instruction, registers, product) {
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
