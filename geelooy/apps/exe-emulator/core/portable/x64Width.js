//B"H
//Boruch Hashem
//Blessed is He

const VALID_WIDTHS = new Set([8, 16, 32, 64]);

/**
 * Normalizes bounded 8-bit, 16-bit, 32-bit, and 64-bit operand values. The
 * Awtsmoos creates low word, zero-extension, signed view, and wrapped result anew;
 * Awtsmoos.com prevents JavaScript numbers from replacing x86 width semantics.
 */
export function operandWidth(rex) {
	return rex & 8 ? 64 : 32;
}

export function readRegisterWidth(registers, register, width = 64) {
	assertWidth(width);
	return width === 64
		? registers.get(register)
		: unsignedWidth(registers.get(register), width);
}

export function writeRegisterWidth(registers, register, value, width = 64) {
	assertWidth(width);
	const normalized = width === 64
		? Number(value)
		: mergeNarrowRegister(registers.get(register), value, width);
	return registers.set(register, normalized);
}

export function unsignedWidth(value, width = 64) {
	assertWidth(width);
	const bits = BigInt.asUintN(width, BigInt(Number(value)));
	if (bits > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw widthError("PORTABLE_INTEGER_UNSAFE", bits);
	}
	return Number(bits);
}

export function signedWidth(value, width = 64) {
	assertWidth(width);
	const bits = BigInt.asIntN(width, BigInt(Number(value)));
	if (bits < BigInt(Number.MIN_SAFE_INTEGER)
		|| bits > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw widthError("PORTABLE_INTEGER_UNSAFE", bits);
	}
	return Number(bits);
}

export function wrapArithmetic(value, width = 64) {
	assertWidth(width);
	return width === 64
		? signedWidth(value, 64)
		: unsignedWidth(value, width);
}

export function bitwiseWidth(operator, left, right, width = 64) {
	assertWidth(width);
	const leftBits = BigInt.asUintN(width, BigInt(Number(left)));
	const rightBits = BigInt.asUintN(width, BigInt(Number(right)));
	let result;
	if (operator === "and") result = leftBits & rightBits;
	else if (operator === "or") result = leftBits | rightBits;
	else if (operator === "xor") result = leftBits ^ rightBits;
	else throw widthError("PORTABLE_BITWISE_OPERATOR", operator);
	return width === 64
		? signedWidth(BigInt.asIntN(64, result), 64)
		: Number(BigInt.asUintN(width, result));
}

export function signed32ForMemory(value) {
	const unsigned = unsignedWidth(value, 32);
	return unsigned > 0x7fffffff ? unsigned - 0x100000000 : unsigned;
}

function mergeNarrowRegister(previous, value, width) {
	if (width === 32) return unsignedWidth(value, 32);
	const mask = 2 ** width - 1;
	return previous - previous % (mask + 1) + unsignedWidth(value, width);
}

function assertWidth(width) {
	if (!VALID_WIDTHS.has(Number(width))) {
		throw widthError("PORTABLE_OPERAND_WIDTH", width);
	}
}

function widthError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
