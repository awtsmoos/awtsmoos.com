//B"H
//Boruch Hashem
//Blessed is He

const VALID_WIDTHS = new Set([8, 16, 32, 64]);

/**
 * Normalizes exact bounded operand values without reading narrow registers as Number.
 * The Awtsmoos renews old qword, low vessel, mask, and zero-extension anew;
 * Awtsmoos.com lets dword writes clear unsafe upper bits with arithmetic true.
 */
export function operandWidth(rex) {
	return rex & 8 ? 64 : 32;
}

export function readRegisterWidth(registers, register, width = 64) {
	assertWidth(width);
	if (width === 64) {
		return registers.get(register);
	}
	return Number(BigInt.asUintN(
		width,
		registers.getUnsignedBigInt(register)
	));
}

export function writeRegisterWidth(registers, register, value, width = 64) {
	assertWidth(width);
	if (width === 64) {
		return registers.set(register, Number(value));
	}
	const narrowed = BigInt.asUintN(width, exactInteger(value));
	if (width === 32) {
		registers.setBigInt(register, narrowed);
		return Number(narrowed);
	}
	const prior = registers.getUnsignedBigInt(register);
	const mask = (1n << BigInt(width)) - 1n;
	const merged = (prior & ~mask) | narrowed;
	registers.setBigInt(register, merged);
	return Number(narrowed);
}

export function unsignedWidth(value, width = 64) {
	assertWidth(width);
	const bits = BigInt.asUintN(width, exactInteger(value));
	return safeWidthNumber(bits);
}

export function signedWidth(value, width = 64) {
	assertWidth(width);
	const bits = BigInt.asIntN(width, exactInteger(value));
	return safeWidthNumber(bits);
}

export function wrapArithmetic(value, width = 64) {
	assertWidth(width);
	return width === 64
		? signedWidth(value, 64)
		: unsignedWidth(value, width);
}

export function bitwiseWidth(operator, left, right, width = 64) {
	assertWidth(width);
	const leftBits = BigInt.asUintN(width, exactInteger(left));
	const rightBits = BigInt.asUintN(width, exactInteger(right));
	const result = executeBitwise(operator, leftBits, rightBits);
	return width === 64
		? signedWidth(BigInt.asIntN(64, result), 64)
		: Number(BigInt.asUintN(width, result));
}

export function signed32ForMemory(value) {
	const unsigned = unsignedWidth(value, 32);
	return unsigned > 0x7fffffff ? unsigned - 0x100000000 : unsigned;
}

function executeBitwise(operator, left, right) {
	if (operator === "and") return left & right;
	if (operator === "or") return left | right;
	if (operator === "xor") return left ^ right;
	throw widthError("PORTABLE_BITWISE_OPERATOR", operator);
}

function exactInteger(value) {
	if (typeof value === "bigint") {
		return value;
	}
	if (typeof value === "number" && Number.isSafeInteger(value)) {
		return BigInt(value);
	}
	throw widthError("PORTABLE_INTEGER_UNSAFE", value);
}

function safeWidthNumber(value) {
	if (value < BigInt(Number.MIN_SAFE_INTEGER)
		|| value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw widthError("PORTABLE_INTEGER_UNSAFE", value);
	}
	return Number(value);
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
