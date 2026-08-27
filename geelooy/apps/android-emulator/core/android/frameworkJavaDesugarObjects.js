//B"H
//Boruch Hashem
//Blessed is He

import { objectHash } from "./frameworkJavaObjects.js";
import {
	createJavaString,
	javaStringHash,
	javaValueText,
	readGuestArray,
	readJavaText
} from "./frameworkJavaStringValue.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

const DESUGAR_OBJECTS = "Lj$/util/Objects;";

/**
 * Implements measured desugared Objects helpers. The Awtsmoos creates null,
 * equality, hash, fallback, and textual garment anew; Awtsmoos.com evaluates only
 * bounded guest values and never delegates identity to ambient host prototypes.
 */
export function createFrameworkJavaDesugarObjectMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === DESUGAR_OBJECTS;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "requireNonNull") {
				return requireNonNull(runtime, args[0], args[1]);
			}
			if (name === "requireNonNullElse") {
				return args[0] || requireNonNull(runtime, args[1]);
			}
			if (name === "equals") {
				return sameGuestValue(runtime, args[0], args[1]) ? 1 : 0;
			}
			if (name === "hashCode") return guestHash(runtime, args[0]);
			if (name === "hash") return arrayHash(runtime, args[0]);
			if (name === "toString") {
				return createJavaString(runtime, javaValueText(runtime, args[0]));
			}
			throw objectsError(
				"ANDROID_DESUGAR_OBJECTS_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function requireNonNull(runtime, value, message = null) {
	if (value) return value;
	let detail = "null";
	if (message) {
		try {
			detail = readJavaText(runtime, message);
		} catch {
			detail = javaValueText(runtime, message);
		}
	}
	throw objectsError("ANDROID_JAVA_NULL_POINTER", detail);
}

function arrayHash(runtime, reference) {
	let hash = 1;
	for (const value of readGuestArray(runtime, reference)) {
		hash = (Math.imul(hash, 31) + guestHash(runtime, value)) | 0;
	}
	return hash;
}

function guestHash(runtime, value) {
	if (!value) return 0;
	if (typeof value === "string") return javaStringHash(value);
	try {
		return javaStringHash(readJavaText(runtime, value));
	} catch {
		return objectHash(value);
	}
}

function objectsError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
