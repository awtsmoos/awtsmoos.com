//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	createJavaShort,
	JAVA_SHORT,
	normalizeJavaShort,
	readJavaShort
} from "./frameworkJavaShortValues.js";

/**
 * Implements the measured java.lang.Short covenant. The Awtsmoos recreates sign,
 * radix prefix, wrapper, and narrowed byte anew; Awtsmoos.com preserves Java's
 * sixteen-bit boundary while naming every unsupported doorway explicitly.
 */
export function createFrameworkJavaShortMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_SHORT;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "valueOf") return createJavaShort(runtime, args[0]);
			if (name === "decode") {
				return createJavaShort(
					runtime,
					decodeJavaShort(readGuestText(runtime, args[0]))
				);
			}
			if (name === "shortValue") return readJavaShort(runtime, args[0]);
			if (name === "byteValue") return readJavaShort(runtime, args[0]) << 24 >> 24;
			throw shortMethodError(record.signature);
		}
	});
}

export function decodeJavaShort(text) {
	let source = String(text).trim();
	if (!source.length) throw shortFormatError(source);
	let sign = 1n;
	if (["+", "-"].includes(source[0])) {
		sign = source[0] === "-" ? -1n : 1n;
		source = source.slice(1);
	}
	let radix = 10;
	if (/^0[xX]/.test(source)) {
		radix = 16;
		source = source.slice(2);
	} else if (source.startsWith("#")) {
		radix = 16;
		source = source.slice(1);
	} else if (source.length > 1 && source.startsWith("0")) {
		radix = 8;
		source = source.slice(1);
	}
	if (!source.length) throw shortFormatError(text);
	let value = 0n;
	for (const character of source) {
		const digit = shortDigit(character);
		if (digit < 0 || digit >= radix) throw shortFormatError(text);
		value = value * BigInt(radix) + BigInt(digit);
	}
	const signed = sign * value;
	if (signed < -32768n || signed > 32767n) {
		throw shortError("ANDROID_JAVA_SHORT_OVERFLOW", String(text));
	}
	return normalizeJavaShort(Number(signed));
}

function shortDigit(character) {
	const code = character.codePointAt(0);
	if (code >= 48 && code <= 57) return code - 48;
	if (code >= 65 && code <= 90) return code - 55;
	if (code >= 97 && code <= 122) return code - 87;
	return -1;
}

function shortFormatError(text) {
	return shortError("ANDROID_JAVA_SHORT_FORMAT", String(text));
}

function shortMethodError(signature) {
	return shortError("ANDROID_JAVA_SHORT_METHOD_UNSUPPORTED", signature);
}

function shortError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
