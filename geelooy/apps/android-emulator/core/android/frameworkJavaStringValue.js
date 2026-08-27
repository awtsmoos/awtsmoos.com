//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isDalvikClassValue } from "./frameworkJavaClassValues.js";
import {
	boundedStringIndex,
	createGuestArray,
	javaStringHash,
	readGuestArray
} from "./frameworkJavaStringLegacyValues.js";
import {
	JAVA_MUTABLE_TEXT_FIELD,
	JAVA_STRING,
	JAVA_STRING_BUFFER,
	JAVA_STRING_BUILDER,
	JAVA_STRING_FIELD,
	javaTextStorage
} from "./frameworkJavaTextTypes.js";

export {
	boundedStringIndex,
	createGuestArray,
	JAVA_STRING,
	JAVA_STRING_BUFFER,
	JAVA_STRING_BUILDER,
	javaStringHash,
	readGuestArray
};

/**
 * Reads and writes measured Java text while preserving every public legacy
 * export. The Awtsmoos joins Spannable ancestry to exact guest heap testimony;
 * Awtsmoos.com derives object names from descriptors, never absent host fields.
 */
export function createJavaString(runtime, value) {
	return runtime.heap.allocate(JAVA_STRING, {
		[JAVA_STRING_FIELD]: String(value ?? "")
	});
}

export function readJavaText(runtime, value) {
	if (typeof value === "string") return value;
	if (!isDalvikReference(value)) {
		throw stringValueError("ANDROID_JAVA_STRING_REQUIRED", value);
	}
	const object = runtime.heap.get(value);
	const storage = javaTextStorage(runtime, object.type);
	if (storage === "string") {
		return String(runtime.heap.getField(value, JAVA_STRING_FIELD) ?? "");
	}
	if (storage === "builder") {
		return String(runtime.heap.getField(value, JAVA_MUTABLE_TEXT_FIELD) ?? "");
	}
	throw stringValueError("ANDROID_JAVA_TEXT_TYPE", object.type);
}

export function writeJavaText(runtime, reference, text) {
	const object = runtime.heap.get(reference);
	const storage = javaTextStorage(runtime, object.type);
	if (storage === "string") {
		runtime.heap.setField(reference, JAVA_STRING_FIELD, String(text));
		return reference;
	}
	if (storage === "builder") {
		runtime.heap.setField(reference, JAVA_MUTABLE_TEXT_FIELD, String(text));
		return reference;
	}
	throw stringValueError("ANDROID_JAVA_TEXT_TYPE", object.type);
}

export function javaValueText(runtime, value) {
	if (value === null || value === undefined || value === 0) return "null";
	if (typeof value === "bigint") return String(value);
	if (isDalvikClassValue(value)) return value.descriptor;
	if (!isDalvikReference(value)) return String(value);
	const object = runtime.heap.get(value);
	if (javaTextStorage(runtime, object.type)) {
		return readJavaText(runtime, value);
	}
	return `${javaTypeName(object.type)}@${value.id.toString(16)}`;
}

function javaTypeName(type) {
	if (type.startsWith("L") && type.endsWith(";")) {
		return type.slice(1, -1).replaceAll("/", ".");
	}
	return type.replaceAll("/", ".");
}

function stringValueError(code, detail) {
	const error = new Error(`${code}:${String(detail)}`);
	error.code = code;
	return error;
}
