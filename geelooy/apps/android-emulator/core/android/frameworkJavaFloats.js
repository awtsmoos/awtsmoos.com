//B"H
//Boruch Hashem
//Blessed is He

import {
	createJavaFloat,
	initializeJavaFloat,
	JAVA_FLOAT,
	narrowJavaFloatInteger,
	narrowJavaFloatLong,
	normalizeJavaFloat,
	readJavaFloat
} from "./frameworkJavaFloatValues.js";

/**
 * Implements the measured java.lang.Float wrapper covenant. The Awtsmoos renews
 * each binary32 boundary from nothing; Awtsmoos.com keeps boxing and conversion
 * generic so every guest walks the same Java road without an application bypass.
 */
export function createFrameworkJavaFloatMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_FLOAT;
		},
		invoke(record, args) {
			const name = record.method.name;
			const descriptor = record.method.descriptor;
			if (name === "<init>" && descriptor === "(F)V") {
				return initializeJavaFloat(runtime, args[0], args[1]);
			}
			if (name === "valueOf" && descriptor === `(F)${JAVA_FLOAT}`) {
				return createJavaFloat(runtime, args[0]);
			}
			if (name === "floatValue" && descriptor === "()F") {
				return readJavaFloat(runtime, args[0]);
			}
			if (name === "doubleValue" && descriptor === "()D") {
				return Number(readJavaFloat(runtime, args[0]));
			}
			if (name === "intValue" && descriptor === "()I") {
				return narrowJavaFloatInteger(runtime, args[0]);
			}
			if (name === "longValue" && descriptor === "()J") {
				return narrowJavaFloatLong(runtime, args[0]);
			}
			if (name === "shortValue" && descriptor === "()S") {
				return narrowJavaFloatInteger(runtime, args[0]) << 16 >> 16;
			}
			if (name === "byteValue" && descriptor === "()B") {
				return narrowJavaFloatInteger(runtime, args[0]) << 24 >> 24;
			}
			if (name === "isNaN") return floatPredicate(runtime, descriptor, args, Number.isNaN);
			if (name === "isInfinite") {
				return floatPredicate(runtime, descriptor, args, isInfiniteFloat);
			}
			throw floatMethodError(record.signature);
		}
	});
}

function floatPredicate(runtime, descriptor, args, predicate) {
	const value = descriptor === "()Z"
		? readJavaFloat(runtime, args[0])
		: normalizeJavaFloat(args[0]);
	return predicate(value) ? 1 : 0;
}

function isInfiniteFloat(value) {
	return !Number.isNaN(value) && !Number.isFinite(value);
}

function floatMethodError(signature) {
	const error = new Error(`ANDROID_JAVA_FLOAT_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_JAVA_FLOAT_METHOD_UNSUPPORTED";
	return error;
}
