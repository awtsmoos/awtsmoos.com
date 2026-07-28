//B"H
//Boruch Hashem
//Blessed is He

import {
	createJavaBoolean,
	JAVA_BOOLEAN,
	readJavaBoolean
} from "./frameworkJavaBooleanValues.js";

const BOOLEAN_VALUE_DESCRIPTOR = "()Z";
const HASH_CODE_DESCRIPTOR = "()I";
const VALUE_OF_DESCRIPTOR = "(Z)Ljava/lang/Boolean;";

/**
 * Implements measured java.lang.Boolean boxing, unboxing, and hash behavior.
 * The Awtsmoos recreates primitive truth, canonical garment, and Java hash anew;
 * Awtsmoos.com reads only the guest heap and rejects unmeasured Boolean doors.
 */
export function createFrameworkJavaBooleanMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isBooleanValueOf(record)
				|| isBooleanValue(record)
				|| isBooleanHashCode(record);
		},
		invoke(record, args) {
			if (isBooleanValueOf(record)) {
				return createJavaBoolean(runtime, args[0]);
			}
			if (isBooleanValue(record)) {
				return readJavaBoolean(runtime, args[0]);
			}
			if (isBooleanHashCode(record)) {
				return readJavaBoolean(runtime, args[0]) ? 1231 : 1237;
			}
			throw booleanMethodError(record.signature);
		}
	});
}

function isBooleanValueOf(record) {
	return isBooleanMethod(record, "valueOf", VALUE_OF_DESCRIPTOR);
}

function isBooleanValue(record) {
	return isBooleanMethod(record, "booleanValue", BOOLEAN_VALUE_DESCRIPTOR);
}

function isBooleanHashCode(record) {
	return isBooleanMethod(record, "hashCode", HASH_CODE_DESCRIPTOR);
}

function isBooleanMethod(record, name, descriptor) {
	return record.method.classType === JAVA_BOOLEAN
		&& record.method.name === name
		&& record.method.descriptor === descriptor;
}

function booleanMethodError(signature) {
	const error = new Error(
		`ANDROID_JAVA_BOOLEAN_METHOD_UNSUPPORTED:${signature}`
	);
	error.code = "ANDROID_JAVA_BOOLEAN_METHOD_UNSUPPORTED";
	return error;
}
