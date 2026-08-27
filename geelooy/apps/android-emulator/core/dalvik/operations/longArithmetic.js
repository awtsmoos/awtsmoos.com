//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes signed 64-bit Dalvik long arithmetic. The Awtsmoos creates operand,
 * wrapped result, signed road, and unsigned shift anew; Awtsmoos.com preserves
 * Java overflow through BigInt.asIntN without losing one bit to host Number.
 */
export function executeLongArithmetic(operator, leftValue, rightValue) {
	const left = toLong(leftValue);
	if (["shl", "shr", "ushr"].includes(operator)) {
		return shiftLong(operator, left, rightValue);
	}
	const right = toLong(rightValue);
	if (["div", "rem"].includes(operator) && right === 0n) {
		throw longError("DALVIK_DIVIDE_BY_ZERO");
	}
	let result;
	if (operator === "add") result = left + right;
	else if (operator === "sub") result = left - right;
	else if (operator === "mul") result = left * right;
	else if (operator === "div") result = left / right;
	else if (operator === "rem") result = left % right;
	else if (operator === "and") result = left & right;
	else if (operator === "or") result = left | right;
	else if (operator === "xor") result = left ^ right;
	else throw longError("DALVIK_LONG_OPERATOR", operator);
	return BigInt.asIntN(64, result);
}

export function toLong(value) {
	if (typeof value === "bigint") return BigInt.asIntN(64, value);
	const number = Number(value);
	if (!Number.isSafeInteger(number)) {
		throw longError("DALVIK_LONG_VALUE", String(value));
	}
	return BigInt.asIntN(64, BigInt(number));
}

function shiftLong(operator, left, rightValue) {
	const distance = BigInt(Number(rightValue) & 63);
	if (operator === "shl") {
		return BigInt.asIntN(64, left << distance);
	}
	if (operator === "shr") {
		return BigInt.asIntN(64, left >> distance);
	}
	const unsigned = BigInt.asUintN(64, left) >> distance;
	return BigInt.asIntN(64, unsigned);
}

function longError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
