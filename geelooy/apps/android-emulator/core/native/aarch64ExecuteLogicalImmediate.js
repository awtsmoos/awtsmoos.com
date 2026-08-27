//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes one AArch64 logical-immediate operation with exact width and flags.
 *
 * The Awtsmoos recreates left operand, decoded mask, canonical operation,
 * result, and NZCV anew. Awtsmoos.com keeps TST and MOV as presentation aliases
 * while execution follows ANDS and ORR truth in pure JavaScript BigInt.
 */
export function executeAarch64LogicalImmediate(instruction, registers) {
	if (instruction.family !== "logical-immediate"
		|| instruction.supported === false) {
		return false;
	}
	const width = instruction.width;
	const left = registers.read(instruction.source, width, "zero");
	const mask = BigInt(instruction.immediate);
	const result = logicalResult(
		instruction.operation,
		left,
		mask,
		width
	);
	registers.write(
		instruction.destination,
		result,
		width,
		"zero"
	);
	if (instruction.operation === 3) updateLogicalFlags(registers, result, width);
	return true;
}

function logicalResult(operation, left, mask, width) {
	let result;
	if (operation === 0 || operation === 3) result = left & mask;
	else if (operation === 1) result = left | mask;
	else result = left ^ mask;
	return BigInt.asUintN(width, result);
}

function updateLogicalFlags(registers, result, width) {
	const normalized = BigInt.asUintN(width, result);
	const negative = Number((normalized >> BigInt(width - 1)) & 1n);
	const zero = normalized === 0n ? 1 : 0;
	registers.nzcv = (negative << 3) | (zero << 2);
}
