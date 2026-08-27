//B"H //Boruch Hashem //Blessed is He

import {
	createJavaBoolean,
	isJavaBooleanReference,
	JAVA_BOOLEAN,
	readJavaBoolean
} from "./frameworkJavaBooleanValues.js";

const BOOLEAN_VALUE_DESCRIPTOR = "()Z";
const EQUALS_DESCRIPTOR = "(Ljava/lang/Object;)Z";
const HASH_CODE_DESCRIPTOR = "()I";
const VALUE_OF_DESCRIPTOR = "(Z)Ljava/lang/Boolean;";

/**
 * Implements measured java.lang.Boolean identity, value, and hash behavior.
 * The Awtsmoos recreates primitive truth and canonical garment anew;
 * Awtsmoos.com compares only real guest objects and rejects unmeasured doors.
 */
export function createFrameworkJavaBooleanMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isBooleanValueOf(record)
				|| isBooleanValue(record)
				|| isBooleanEquals(record)
				|| isBooleanHashCode(record);
		},
		invoke(record, args) {
			if (isBooleanValueOf(record)) {
				return createJavaBoolean(runtime, args[0]);
			}
			if (isBooleanValue(record)) {
				return readJavaBoolean(runtime, args[0]);
			}
			if (isBooleanEquals(record)) {
				return equalJavaBoolean(runtime, args[0], args[1]);
			}
			if (isBooleanHashCode(record)) {
				return readJavaBoolean(runtime, args[0]) ? 1231 : 1237;
			}
			throw booleanMethodError(record.signature);
		}
	});
}

function equalJavaBoolean(runtime, receiver, candidate) {
	const receiverValue = readJavaBoolean(runtime, receiver);
	if (!isJavaBooleanReference(runtime, candidate)) return 0;
	return receiverValue === readJavaBoolean(runtime, candidate) ? 1 : 0;
}

function isBooleanValueOf(record) {
	return isBooleanMethod(record, "valueOf", VALUE_OF_DESCRIPTOR);
}

function isBooleanValue(record) {
	return isBooleanMethod(record, "booleanValue", BOOLEAN_VALUE_DESCRIPTOR);
}

function isBooleanEquals(record) {
	return isBooleanMethod(record, "equals", EQUALS_DESCRIPTOR);
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
