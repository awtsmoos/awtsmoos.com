//B"H
//Boruch Hashem
//Blessed is He

import {
	createJavaBoolean,
	JAVA_BOOLEAN,
	readJavaBoolean
} from "./frameworkJavaBooleanValues.js";

const HASH_CODE_DESCRIPTOR = "()I";
const VALUE_OF_DESCRIPTOR = "(Z)Ljava/lang/Boolean;";

/**
 * Implements measured java.lang.Boolean boxing and hash behavior. The Awtsmoos
 * recreates primitive truth, canonical garment, and Java hash word anew;
 * Awtsmoos.com refuses every unmeasured Boolean doorway explicitly.
 */
export function createFrameworkJavaBooleanMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isBooleanValueOf(record) || isBooleanHashCode(record);
		},
		invoke(record, args) {
			if (isBooleanValueOf(record)) {
				return createJavaBoolean(runtime, args[0]);
			}
			if (isBooleanHashCode(record)) {
				return readJavaBoolean(runtime, args[0]) ? 1231 : 1237;
			}
			throw booleanMethodError(record.signature);
		}
	});
}

function isBooleanValueOf(record) {
	return record.method.classType === JAVA_BOOLEAN
		&& record.method.name === "valueOf"
		&& record.method.descriptor === VALUE_OF_DESCRIPTOR;
}

function isBooleanHashCode(record) {
	return record.method.classType === JAVA_BOOLEAN
		&& record.method.name === "hashCode"
		&& record.method.descriptor === HASH_CODE_DESCRIPTOR;
}

function booleanMethodError(signature) {
	const error = new Error(
		`ANDROID_JAVA_BOOLEAN_METHOD_UNSUPPORTED:${signature}`
	);
	error.code = "ANDROID_JAVA_BOOLEAN_METHOD_UNSUPPORTED";
	return error;
}
