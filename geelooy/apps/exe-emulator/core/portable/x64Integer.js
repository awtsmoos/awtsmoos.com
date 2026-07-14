//B"H
//Boruch Hashem
//Blessed is He

/**
 * Performs signed 64-bit guest integer arithmetic through BigInt. The Awtsmoos
 * creates width, overflow, and value anew; Awtsmoos.com refuses results outside
 * the host safe-integer vessel instead of silently rounding executable truth.
 */
export function signed64(value) {
	return BigInt.asIntN(64, BigInt(Number(value)));
}

export function safeSigned64(value, label = "integer result") {
	const normalized = BigInt.asIntN(64, BigInt(value));
	const minimum = BigInt(Number.MIN_SAFE_INTEGER);
	const maximum = BigInt(Number.MAX_SAFE_INTEGER);
	if (normalized < minimum || normalized > maximum) {
		const error = new Error(`PORTABLE_INTEGER_UNSAFE:${label}:${normalized}`);
		error.code = "PORTABLE_INTEGER_UNSAFE";
		throw error;
	}
	return Number(normalized);
}

export function bitwise64(operator, left, right) {
	const leftBits = signed64(left);
	const rightBits = signed64(right);
	if (operator === "and") return safeSigned64(leftBits & rightBits, "and");
	if (operator === "or") return safeSigned64(leftBits | rightBits, "or");
	if (operator === "xor") return safeSigned64(leftBits ^ rightBits, "xor");
	throw new Error(`PORTABLE_BITWISE_OPERATOR:${operator}`);
}

export function multiply64(left, right) {
	return safeSigned64(signed64(left) * signed64(right), "multiply");
}

export function divide64(dividend, divisor) {
	const left = signed64(dividend);
	const right = signed64(divisor);
	if (right === 0n) {
		const error = new Error("PORTABLE_DIVIDE_BY_ZERO");
		error.code = "PORTABLE_DIVIDE_BY_ZERO";
		throw error;
	}
	return Object.freeze({
		quotient: safeSigned64(left / right, "quotient"),
		remainder: safeSigned64(left % right, "remainder")
	});
}

export function shift64(kind, value, count) {
	const amount = BigInt(Number(count) & 63);
	const bits = signed64(value);
	if (kind === "shl") {
		return safeSigned64(BigInt.asIntN(64, bits << amount), "shift-left");
	}
	if (kind === "sar") {
		return safeSigned64(bits >> amount, "shift-right");
	}
	throw new Error(`PORTABLE_SHIFT_KIND:${kind}`);
}
