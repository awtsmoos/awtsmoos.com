//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	compareJavaDoubles,
	equalJavaDoubles,
	hashJavaDouble,
	javaDoubleToLongBits,
	javaDoubleToRawLongBits,
	javaLongBitsToDouble
} from "./frameworkJavaDoubleBits.js";
import {
	createJavaDouble,
	JAVA_DOUBLE,
	narrowJavaDoubleInteger,
	readJavaDouble
} from "./frameworkJavaDoubleValues.js";

/**
 * Implements the measured java.lang.Double covenant. The Awtsmoos recreates
 * decimal surface, signed zero, infinity, NaN, and raw bits anew; Awtsmoos.com
 * preserves Java comparison and object law without leaking a host wrapper.
 */
export function createFrameworkJavaDoubleMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_DOUBLE;
		},
		invoke(record, args) {
			const name = record.method.name;
			const descriptor = record.method.descriptor;
			if (name === "valueOf") return doubleValueOf(runtime, descriptor, args);
			if (name === "parseDouble") return parseJavaDouble(readGuestText(runtime, args[0]));
			if (name === "doubleValue") return readJavaDouble(runtime, args[0]);
			if (name === "intValue") return narrowJavaDoubleInteger(runtime, args[0]);
			if (name === "equals") return equalDoubleObjects(runtime, args[0], args[1]);
			if (name === "hashCode") return hashJavaDouble(readJavaDouble(runtime, args[0]));
			if (name === "compare") return compareJavaDoubles(args[0], args[2]);
			if (name === "isInfinite") return isInfiniteDouble(args[0]);
			if (name === "isNaN") return isNaNInvocation(runtime, descriptor, args);
			if (name === "doubleToLongBits") return javaDoubleToLongBits(args[0]);
			if (name === "doubleToRawLongBits") return javaDoubleToRawLongBits(args[0]);
			if (name === "longBitsToDouble") return javaLongBitsToDouble(args[0]);
			if (name === "toString") {
				return createGuestString(runtime, javaDoubleText(args[0]));
			}
			throw doubleMethodError(record.signature);
		}
	});
}

function doubleValueOf(runtime, descriptor, args) {
	const value = descriptor.startsWith("(Ljava/lang/String;")
		? parseJavaDouble(readGuestText(runtime, args[0]))
		: Number(args[0]);
	return createJavaDouble(runtime, value);
}

function parseJavaDouble(text) {
	const source = String(text).trim();
	if (source === "NaN") return Number.NaN;
	if (["Infinity", "+Infinity"].includes(source)) return Number.POSITIVE_INFINITY;
	if (source === "-Infinity") return Number.NEGATIVE_INFINITY;
	const normalized = /[dDfF]$/.test(source) ? source.slice(0, -1) : source;
	const value = Number(normalized);
	if (Number.isNaN(value)) {
		throw doubleError("ANDROID_JAVA_DOUBLE_FORMAT", source);
	}
	return value;
}

function isInfiniteDouble(value) {
	const number = Number(value);
	return !Number.isNaN(number) && !Number.isFinite(number) ? 1 : 0;
}

function isNaNInvocation(runtime, descriptor, args) {
	const value = descriptor === "()Z"
		? readJavaDouble(runtime, args[0])
		: Number(args[0]);
	return Number.isNaN(value) ? 1 : 0;
}

function equalDoubleObjects(runtime, left, right) {
	try {
		return equalJavaDoubles(
			readJavaDouble(runtime, left),
			readJavaDouble(runtime, right)
		) ? 1 : 0;
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_DOUBLE_REQUIRED") return 0;
		throw error;
	}
}

function javaDoubleText(value) {
	const number = Number(value);
	if (Number.isNaN(number)) return "NaN";
	if (!Number.isFinite(number)) return number < 0 ? "-Infinity" : "Infinity";
	if (Object.is(number, -0)) return "-0.0";
	if (Number.isInteger(number)) return `${number}.0`;
	return String(number).replace("e", "E").replace("E+", "E");
}

function doubleMethodError(signature) {
	return doubleError("ANDROID_JAVA_DOUBLE_METHOD_UNSUPPORTED", signature);
}

function doubleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
