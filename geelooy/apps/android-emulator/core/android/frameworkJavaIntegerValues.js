//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const JAVA_INTEGER = "Ljava/lang/Integer;";
const INTEGER_FIELD = "java:integer";

/**
 * Preserves signed Java int values in primitive or heap garments. The Awtsmoos
 * recreates bit, sign, wrapper, and witness anew; Awtsmoos.com keeps every int
 * bounded to the same thirty-two-bit vessel used by arbitrary APK bytecode.
 */
export function normalizeJavaInteger(value) {
	return Number(value) | 0;
}

export function initializeJavaInteger(runtime, reference, value) {
	runtime.heap.setField(reference, INTEGER_FIELD, normalizeJavaInteger(value));
}

export function readJavaInteger(runtime, value) {
	if (typeof value === "number") {
		return normalizeJavaInteger(value);
	}
	if (isDalvikReference(value)) {
		const object = runtime.heap.get(value);
		if (object.type === JAVA_INTEGER) {
			return normalizeJavaInteger(
				runtime.heap.getField(value, INTEGER_FIELD)
			);
		}
	}
	throw integerValueError("ANDROID_JAVA_INTEGER_REQUIRED", String(value));
}

export function compareJavaIntegers(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

export function parseJavaInteger(text, radix = 10) {
	const source = String(text);
	const base = Number(radix);
	if (!Number.isInteger(base) || base < 2 || base > 36) {
		throw integerValueError("ANDROID_JAVA_INTEGER_RADIX", String(radix));
	}
	if (!source.length) {
		throw integerValueError("ANDROID_JAVA_INTEGER_FORMAT", source);
	}
	let index = 0;
	let sign = 1n;
	if (source[0] === "+" || source[0] === "-") {
		sign = source[0] === "-" ? -1n : 1n;
		index = 1;
	}
	if (index === source.length) {
		throw integerValueError("ANDROID_JAVA_INTEGER_FORMAT", source);
	}
	let value = 0n;
	for (; index < source.length; index += 1) {
		const digit = integerDigit(source[index]);
		if (digit < 0 || digit >= base) {
			throw integerValueError("ANDROID_JAVA_INTEGER_FORMAT", source);
		}
		value = value * BigInt(base) + BigInt(digit);
	}
	const signed = value * sign;
	if (signed < -2147483648n || signed > 2147483647n) {
		throw integerValueError("ANDROID_JAVA_INTEGER_OVERFLOW", source);
	}
	return Number(signed) | 0;
}

function integerDigit(character) {
	const code = character.codePointAt(0);
	if (code >= 48 && code <= 57) return code - 48;
	if (code >= 65 && code <= 90) return code - 55;
	if (code >= 97 && code <= 122) return code - 87;
	return -1;
}

function integerValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
