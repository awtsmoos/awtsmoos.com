//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	compareJavaLongs,
	hashJavaLong,
	initializeJavaLong,
	JAVA_LONG,
	narrowJavaLong,
	normalizeJavaLong,
	readJavaLong
} from "./frameworkJavaLongValues.js";

/**
 * Implements exact signed Java Long boxing and conversion. The Awtsmoos creates
 * value, wrapper garment, comparison, and textual witness anew; Awtsmoos.com
 * preserves every bit through BigInt instead of host Number.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @returns {object} Framework family for java.lang.Long.
 */
export function createFrameworkJavaLongMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_LONG;
		},
		invoke(record, args) {
			const name = record.method.name;
			const descriptor = record.method.descriptor;
			if (name === "<init>" && descriptor === "(J)V") {
				return initializeJavaLong(runtime, args[0], args[1]);
			}
			if (name === "valueOf" && descriptor === `(J)${JAVA_LONG}`) {
				return normalizeJavaLong(args[0]);
			}
			if (name === "longValue") return readJavaLong(runtime, args[0]);
			if (name === "intValue") return narrowJavaLong(runtime, args[0], 32);
			if (name === "shortValue") return narrowJavaLong(runtime, args[0], 16);
			if (name === "byteValue") return narrowJavaLong(runtime, args[0], 8);
			if (["floatValue", "doubleValue"].includes(name)) {
				return Number(readJavaLong(runtime, args[0]));
			}
			if (name === "toString") return longText(runtime, descriptor, args);
			if (name === "hashCode") return longHash(runtime, descriptor, args);
			if (name === "equals") return longEquals(runtime, args[0], args[1]);
			if (name === "compareTo") {
				return compareJavaLongs(
					readJavaLong(runtime, args[0]),
					readJavaLong(runtime, args[1])
				);
			}
			if (name === "compare" && descriptor === "(JJ)I") {
				return compareJavaLongs(
					normalizeJavaLong(args[0]),
					normalizeJavaLong(args[2])
				);
			}
			throw longMethodError(
				"ANDROID_JAVA_LONG_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function longText(runtime, descriptor, args) {
	const value = descriptor.startsWith("(J")
		? normalizeJavaLong(args[0])
		: readJavaLong(runtime, args[0]);
	return createGuestString(runtime, value.toString());
}

function longHash(runtime, descriptor, args) {
	const value = descriptor.startsWith("(J")
		? normalizeJavaLong(args[0])
		: readJavaLong(runtime, args[0]);
	return hashJavaLong(value);
}

function longEquals(runtime, left, right) {
	try {
		return readJavaLong(runtime, left) === readJavaLong(runtime, right)
			? 1
			: 0;
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_LONG_REQUIRED") return 0;
		throw error;
	}
}

function longMethodError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
