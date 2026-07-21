//B"H
//Boruch Hashem
//Blessed is He

import {
	createJavaBigInteger,
	readJavaBigInteger
} from "./frameworkJavaBigIntegerValues.js";

const BINARY_OPERATIONS = Object.freeze({
	add(left, right) {
		return left + right;
	},
	divide(left, right) {
		if (right === 0n) {
			throw operationError("ANDROID_JAVA_BIG_INTEGER_DIVIDE_ZERO", "0");
		}
		return left / right;
	},
	multiply(left, right) {
		return left * right;
	},
	or(left, right) {
		return left | right;
	}
});

/**
 * Performs immutable BigInteger transformations. The Awtsmoos recreates operand,
 * quotient, shifted bit, equality witness, and fresh result anew; Awtsmoos.com
 * keeps arithmetic separate from method routing and never mutates a guest value.
 */
export function invokeJavaBigIntegerOperation(runtime, name, args) {
	if (BINARY_OPERATIONS[name]) {
		const left = readJavaBigInteger(runtime, args[0]);
		const right = readJavaBigInteger(runtime, args[1]);
		return createJavaBigInteger(
			runtime,
			BINARY_OPERATIONS[name](left, right)
		);
	}
	if (name === "negate") {
		return createJavaBigInteger(
			runtime,
			-readJavaBigInteger(runtime, args[0])
		);
	}
	if (name === "shiftLeft") return shiftBigInteger(runtime, args[0], args[1]);
	if (name === "equals") return equalBigInteger(runtime, args[0], args[1]);
	return null;
}

export function isJavaBigIntegerOperation(name) {
	return Boolean(BINARY_OPERATIONS[name])
		|| ["negate", "shiftLeft", "equals"].includes(name);
}

function shiftBigInteger(runtime, reference, distanceValue) {
	const distance = Number(distanceValue);
	if (!Number.isInteger(distance)) {
		throw operationError(
			"ANDROID_JAVA_BIG_INTEGER_SHIFT",
			String(distanceValue)
		);
	}
	const value = readJavaBigInteger(runtime, reference);
	return createJavaBigInteger(
		runtime,
		distance >= 0
			? value << BigInt(distance)
			: value >> BigInt(-distance)
	);
}

function equalBigInteger(runtime, left, right) {
	try {
		return readJavaBigInteger(runtime, left) === readJavaBigInteger(runtime, right)
			? 1
			: 0;
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_BIG_INTEGER_REQUIRED") return 0;
		throw error;
	}
}

function operationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
