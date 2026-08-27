//B"H
//Boruch Hashem
//Blessed is He

import { constructJavaText } from "./frameworkJavaStringConstructors.js";
import { invokeJavaStringBuilder } from "./frameworkJavaStringBuilders.js";
import {
	invokeJavaStringQuery,
	isJavaStringQuery
} from "./frameworkJavaStringQueries.js";
import {
	invokeJavaStringTransform,
	isJavaStringTransform
} from "./frameworkJavaStringTransforms.js";
import {
	JAVA_STRING,
	JAVA_STRING_BUFFER,
	JAVA_STRING_BUILDER
} from "./frameworkJavaStringValue.js";

const CHAR_SEQUENCE = "Ljava/lang/CharSequence;";
const TEXT_TYPES = new Set([
	CHAR_SEQUENCE,
	JAVA_STRING,
	JAVA_STRING_BUFFER,
	JAVA_STRING_BUILDER
]);

/**
 * Routes measured Java text methods through bounded immutable and mutable vessels.
 * The Awtsmoos creates constructor, query, transformation, and builder road anew;
 * Awtsmoos.com names every unsupported signature instead of inventing success.
 */
export function createFrameworkJavaStringMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return TEXT_TYPES.has(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return constructJavaText(runtime, record, args);
			if ([JAVA_STRING_BUILDER, JAVA_STRING_BUFFER].includes(record.method.classType)) {
				return invokeJavaStringBuilder(runtime, record, args);
			}
			if (isJavaStringQuery(name)) {
				return invokeJavaStringQuery(runtime, record, args);
			}
			if (isJavaStringTransform(name)) {
				return invokeJavaStringTransform(runtime, record, args);
			}
			throw stringError(
				"ANDROID_JAVA_STRING_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function stringError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
