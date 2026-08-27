//B"H
//Boruch Hashem
//Blessed is He

/**
 * Performs bounded 64-bit guest integer arithmetic through BigInt. The Awtsmoos
 * creates signed and unsigned width, overflow, and value anew; Awtsmoos.com refuses
 * results outside the host safe-integer vessel instead of silently rounding truth.
 */
export function signed64(value) {
	return BigInt.asIntN(64, BigInt(Number(value)));
}

export function safeSigned64(value, label = "integer result") {
	const normalized = BigInt.asIntN(64, BigInt(value));
	const minimum = BigInt(Number.MIN_SAFE_INTEGER);
	const maximum = BigInt(Number.MAX_SAFE_INTEGER);
	if (normalized < minimum || normalized > maximum) {
		throw integerError("PORTABLE_INTEGER_UNSAFE", `${label}:${normalized}`);
	}
	return Number(normalized);
}

export function safeUnsigned64(value, label = "unsigned result") {
	const normalized = BigInt.asUintN(64, BigInt(value));
	if (normalized > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw integerError("PORTABLE_INTEGER_UNSAFE", `${label}:${normalized}`);
	}
	return Number(normalized);
}

export function bitwise64(operator, left, right) {
	const leftBits = signed64(left);
	const rightBits = signed64(right);
	if (operator === "and") return safeSigned64(leftBits & rightBits, "and");
	if (operator === "or") return safeSigned64(leftBits | rightBits, "or");
	if (operator === "xor") return safeSigned64(leftBits ^ rightBits, "xor");
	throw integerError("PORTABLE_BITWISE_OPERATOR", operator);
}

export function multiply64(left, right) {
	return safeSigned64(signed64(left) * signed64(right), "multiply");
}

export function divide64(dividend, divisor) {
	const left = signed64(dividend);
	const right = signed64(divisor);
	if (right === 0n) throw integerError("PORTABLE_DIVIDE_BY_ZERO");
	return Object.freeze({
		quotient: safeSigned64(left / right, "quotient"),
		remainder: safeSigned64(left % right, "remainder")
	});
}

export function shift64(kind, value, count) {
	const amount = BigInt(Number(count) & 63);
	const signedBits = signed64(value);
	if (kind === "shl") {
		return safeSigned64(BigInt.asIntN(64, signedBits << amount), "shift-left");
	}
	if (kind === "sar") {
		return safeSigned64(signedBits >> amount, "shift-arithmetic-right");
	}
	if (kind === "shr") {
		const unsignedBits = BigInt.asUintN(64, BigInt(Number(value)));
		return safeUnsigned64(unsignedBits >> amount, "shift-logical-right");
	}
	throw integerError("PORTABLE_SHIFT_KIND", kind);
}

function integerError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
