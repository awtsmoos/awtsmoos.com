//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	compareJavaIntegers,
	initializeJavaInteger,
	JAVA_INTEGER,
	normalizeJavaInteger,
	parseJavaInteger,
	readJavaInteger
} from "./frameworkJavaIntegerValues.js";

/**
 * Reveals the common java.lang.Integer covenant. The Awtsmoos recreates sign,
 * wrapper, comparison, and text anew; Awtsmoos.com preserves Java int behavior
 * generically for every APK rather than teaching one application a shortcut.
 */
export function createFrameworkJavaIntegerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_INTEGER;
		},
		invoke(record, args) {
			const name = record.method.name;
			const descriptor = record.method.descriptor;
			if (name === "<init>" && descriptor === "(I)V") {
				return initializeJavaInteger(runtime, args[0], args[1]);
			}
			if (name === "valueOf") return integerValueOf(runtime, descriptor, args);
			if (name === "intValue") return readJavaInteger(runtime, args[0]);
			if (name === "longValue") return BigInt(readJavaInteger(runtime, args[0]));
			if (name === "shortValue") return readJavaInteger(runtime, args[0]) << 16 >> 16;
			if (name === "byteValue") return readJavaInteger(runtime, args[0]) << 24 >> 24;
			if (["floatValue", "doubleValue"].includes(name)) {
				return Number(readJavaInteger(runtime, args[0]));
			}
			if (name === "toString") return integerText(runtime, descriptor, args);
			if (name === "toHexString") return unsignedText(runtime, args[0], 16);
			if (name === "toOctalString") return unsignedText(runtime, args[0], 8);
			if (name === "toBinaryString") return unsignedText(runtime, args[0], 2);
			if (name === "parseInt") return parseIntegerArguments(runtime, args);
			if (name === "hashCode") return integerHash(runtime, descriptor, args);
			if (name === "equals") return integerEquals(runtime, args[0], args[1]);
			if (name === "compareTo") {
				return compareJavaIntegers(
					readJavaInteger(runtime, args[0]),
					readJavaInteger(runtime, args[1])
				);
			}
			if (name === "compare") {
				return compareJavaIntegers(
					normalizeJavaInteger(args[0]),
					normalizeJavaInteger(args[1])
				);
			}
			if (name === "signum") return Math.sign(normalizeJavaInteger(args[0]));
			if (name === "sum") return normalizeJavaInteger(args[0] + args[1]);
			if (name === "max") return Math.max(args[0], args[1]) | 0;
			if (name === "min") return Math.min(args[0], args[1]) | 0;
			throw integerMethodError(record.signature);
		}
	});
}

function integerValueOf(runtime, descriptor, args) {
	if (descriptor.startsWith("(I)")) return normalizeJavaInteger(args[0]);
	const radix = descriptor.includes("Ljava/lang/String;I") ? args[1] : 10;
	return parseJavaInteger(readGuestText(runtime, args[0]), radix);
}

function integerText(runtime, descriptor, args) {
	const staticCall = descriptor.startsWith("(I");
	const value = staticCall
		? normalizeJavaInteger(args[0])
		: readJavaInteger(runtime, args[0]);
	const radix = descriptor.startsWith("(II") ? Number(args[1]) : 10;
	return createGuestString(runtime, value.toString(radix));
}

function unsignedText(runtime, value, radix) {
	return createGuestString(runtime, (Number(value) >>> 0).toString(radix));
}

function parseIntegerArguments(runtime, args) {
	const radix = args.length > 1 ? args[1] : 10;
	return parseJavaInteger(readGuestText(runtime, args[0]), radix);
}

function integerHash(runtime, descriptor, args) {
	return descriptor.startsWith("(I")
		? normalizeJavaInteger(args[0])
		: readJavaInteger(runtime, args[0]);
}

function integerEquals(runtime, left, right) {
	try {
		return readJavaInteger(runtime, left) === readJavaInteger(runtime, right)
			? 1
			: 0;
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_INTEGER_REQUIRED") return 0;
		throw error;
	}
}

function integerMethodError(signature) {
	const error = new Error(`ANDROID_JAVA_INTEGER_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_JAVA_INTEGER_METHOD_UNSUPPORTED";
	return error;
}
