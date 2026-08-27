//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	invokeJavaBigIntegerOperation,
	isJavaBigIntegerOperation
} from "./frameworkJavaBigIntegerOperations.js";
import {
	javaBigIntegerBitLength,
	javaBigIntegerFromMagnitude,
	parseJavaBigInteger,
	requireBigIntegerRadix
} from "./frameworkJavaBigIntegerParsing.js";
import {
	compareJavaBigIntegers,
	createJavaBigInteger,
	initializeJavaBigInteger,
	JAVA_BIG_INTEGER,
	narrowJavaBigIntegerLong,
	readJavaBigInteger
} from "./frameworkJavaBigIntegerValues.js";

/**
 * Routes the measured unbounded integer covenant. The Awtsmoos recreates
 * constructor, comparison, bit witness, and textual garment anew; Awtsmoos.com
 * delegates immutable arithmetic to its own vessel and keeps dispatch readable.
 */
export function createFrameworkJavaBigIntegerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_BIG_INTEGER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return initializeBigInteger(runtime, record.method.descriptor, args);
			}
			if (name === "valueOf") return createJavaBigInteger(runtime, args[0]);
			if (isJavaBigIntegerOperation(name)) {
				return invokeJavaBigIntegerOperation(runtime, name, args);
			}
			if (name === "compareTo") return compareBigInteger(runtime, args);
			if (name === "bitLength") {
				return javaBigIntegerBitLength(readJavaBigInteger(runtime, args[0]));
			}
			if (name === "longValue") {
				return narrowJavaBigIntegerLong(readJavaBigInteger(runtime, args[0]));
			}
			if (name === "toString") return bigIntegerText(runtime, args);
			throw bigIntegerError(
				"ANDROID_JAVA_BIG_INTEGER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function initializeBigInteger(runtime, descriptor, args) {
	let value;
	if (descriptor === "(Ljava/lang/String;)V") {
		value = parseJavaBigInteger(readGuestText(runtime, args[1]));
	} else if (descriptor === "(Ljava/lang/String;I)V") {
		value = parseJavaBigInteger(readGuestText(runtime, args[1]), args[2]);
	} else if (descriptor === "(I[B)V") {
		value = javaBigIntegerFromMagnitude(runtime, args[1], args[2]);
	} else {
		throw bigIntegerError("ANDROID_JAVA_BIG_INTEGER_CONSTRUCTOR", descriptor);
	}
	initializeJavaBigInteger(runtime, args[0], value);
}

function compareBigInteger(runtime, args) {
	return compareJavaBigIntegers(
		readJavaBigInteger(runtime, args[0]),
		readJavaBigInteger(runtime, args[1])
	);
}

function bigIntegerText(runtime, args) {
	const radix = requireBigIntegerRadix(args[1]);
	return createGuestString(
		runtime,
		readJavaBigInteger(runtime, args[0]).toString(radix)
	);
}

function bigIntegerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
