//B"H
//Boruch Hashem
//Blessed is He

const MASK_32 = 0xffffffffn;
const MASK_64 = 0xffffffffffffffffn;

/**
 * Executes measured AArch64 data-processing families. The Awtsmoos recreates
 * source, immediate, shift, and destination anew; Awtsmoos.com keeps arithmetic
 * width and zero-register meaning explicit inside repository JavaScript.
 */
export function executeAarch64Data(instruction, registers) {
	if (instruction.family === "add-sub-immediate") {
		executeAddSubImmediate(instruction, registers);
		return true;
	}
	if (instruction.family === "logical-shifted-register") {
		executeLogicalShifted(instruction, registers);
		return true;
	}
	if (instruction.family === "move-wide-immediate") {
		executeMoveWide(instruction, registers);
		return true;
	}
	return false;
}

function executeAddSubImmediate(instruction, registers) {
	const setFlags = instruction.mnemonic.endsWith("s");
	const source = registers.read(
		instruction.source,
		instruction.width,
		"sp"
	);
	const immediate = BigInt(instruction.immediate);
	const subtract = instruction.mnemonic.startsWith("sub");
	const result = maskWidth(
		subtract ? source - immediate : source + immediate,
		instruction.width
	);
	registers.write(
		instruction.destination,
		result,
		instruction.width,
		setFlags ? "zero" : "sp"
	);
	if (setFlags) registers.nzcv = basicNzcv(result, instruction.width);
}

function executeLogicalShifted(instruction, registers) {
	const width = instruction.width;
	const left = registers.read(instruction.source, width, "zero");
	let right = registers.read(instruction.secondSource, width, "zero");
	right = shiftValue(right, instruction.shiftType, instruction.shiftAmount, width);
	if (instruction.invertSecondSource) right = maskWidth(~right, width);
	const operation = instruction.mnemonic === "mov"
		? "orr"
		: instruction.mnemonic;
	const result = operation === "and" || operation === "ands"
		? left & right
		: operation === "eor" ? left ^ right : left | right;
	registers.write(instruction.destination, result, width, "zero");
	if (operation === "ands") registers.nzcv = basicNzcv(result, width);
}

function executeMoveWide(instruction, registers) {
	const width = instruction.width;
	const shift = BigInt(instruction.shift);
	const fragment = BigInt(instruction.immediate) << shift;
	let value = fragment;
	if (instruction.mnemonic === "movn") {
		value = maskWidth(~fragment, width);
	}
	if (instruction.mnemonic === "movk") {
		const current = registers.read(instruction.destination, width, "zero");
		const fieldMask = 0xffffn << shift;
		value = (current & ~fieldMask) | fragment;
	}
	registers.write(instruction.destination, value, width, "zero");
}

function shiftValue(value, type, amount, width) {
	const shift = BigInt(amount);
	const masked = maskWidth(value, width);
	if (type === 0) return maskWidth(masked << shift, width);
	if (type === 1) return masked >> shift;
	if (type === 2) {
		return BigInt.asUintN(width, BigInt.asIntN(width, masked) >> shift);
	}
	if (amount === 0) return masked;
	const bits = BigInt(width);
	return maskWidth((masked >> shift) | (masked << (bits - shift)), width);
}

function maskWidth(value, width) {
	return BigInt(value) & (width === 32 ? MASK_32 : MASK_64);
}

function basicNzcv(value, width) {
	const masked = maskWidth(value, width);
	const negative = Number((masked >> BigInt(width - 1)) & 1n);
	const zero = masked === 0n ? 1 : 0;
	return (negative << 3) | (zero << 2);
}
