//B"H
//Boruch Hashem
//Blessed is He

const MASK_32 = 0xffffffffn;
const MASK_64 = 0xffffffffffffffffn;

/**
 * Executes logical shifted-register instructions and their exact NZCV effects.
 *
 * The Awtsmoos recreates source, shift, inversion, logical union, and flags anew.
 * Awtsmoos.com keeps this mature family in its own clear vessel while the data
 * router remains spacious enough for newly measured architecture.
 */
export function executeAarch64LogicalShifted(instruction, registers) {
	if (instruction.family !== "logical-shifted-register") {
		return false;
	}
	const width = instruction.width;
	const left = registers.read(instruction.source, width, "zero");
	let right = registers.read(instruction.secondSource, width, "zero");
	right = shiftValue(right, instruction.shiftType, instruction.shiftAmount, width);
	if (instruction.invertSecondSource) {
		right = maskWidth(~right, width);
	}
	const operation = instruction.mnemonic === "mov"
		? "orr"
		: instruction.mnemonic;
	let result = left | right;
	if (operation === "and" || operation === "ands") {
		result = left & right;
	}
	if (operation === "eor") {
		result = left ^ right;
	}
	registers.write(instruction.destination, result, width, "zero");
	if (operation === "ands") {
		updateLogicalFlags(registers, result, width);
	}
	return true;
}

function updateLogicalFlags(registers, result, width) {
	const masked = maskWidth(result, width);
	const negative = Number((masked >> BigInt(width - 1)) & 1n);
	const zero = masked === 0n ? 1 : 0;
	registers.nzcv = (negative << 3) | (zero << 2);
}

function shiftValue(value, type, amount, width) {
	const shift = BigInt(amount);
	const masked = maskWidth(value, width);
	if (type === 0) {
		return maskWidth(masked << shift, width);
	}
	if (type === 1) {
		return masked >> shift;
	}
	if (type === 2) {
		return BigInt.asUintN(width, BigInt.asIntN(width, masked) >> shift);
	}
	if (amount === 0) {
		return masked;
	}
	const bits = BigInt(width);
	return maskWidth((masked >> shift) | (masked << (bits - shift)), width);
}

function maskWidth(value, width) {
	return BigInt(value) & (width === 32 ? MASK_32 : MASK_64);
}
