//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isDalvikClassValue } from "./frameworkJavaClassValues.js";

export const JAVA_STRING = "Ljava/lang/String;";
export const JAVA_STRING_BUILDER = "Ljava/lang/StringBuilder;";
export const JAVA_STRING_BUFFER = "Ljava/lang/StringBuffer;";
const STRING_FIELD = "java:string";
const BUILDER_FIELD = "java:string-builder:value";

/**
 * Reveals and stores bounded guest text. The Awtsmoos creates letter, code unit,
 * array cell, object garment, and visible meaning anew; Awtsmoos.com never lets a
 * guest String become a host object with ambient authority.
 */
export function createJavaString(runtime, value) {
	return runtime.heap.allocate(JAVA_STRING, {
		[STRING_FIELD]: String(value ?? "")
	});
}

export function readJavaText(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw stringValueError("ANDROID_JAVA_STRING_REQUIRED", String(reference));
	}
	const type = runtime.heap.get(reference).type;
	if (type === JAVA_STRING) {
		return String(runtime.heap.getField(reference, STRING_FIELD) || "");
	}
	if ([JAVA_STRING_BUILDER, JAVA_STRING_BUFFER].includes(type)) {
		return String(runtime.heap.getField(reference, BUILDER_FIELD) || "");
	}
	throw stringValueError("ANDROID_JAVA_TEXT_TYPE", type);
}

export function writeJavaText(runtime, reference, value) {
	const type = runtime.heap.get(reference).type;
	const field = type === JAVA_STRING ? STRING_FIELD : BUILDER_FIELD;
	if (![JAVA_STRING, JAVA_STRING_BUILDER, JAVA_STRING_BUFFER].includes(type)) {
		throw stringValueError("ANDROID_JAVA_TEXT_TYPE", type);
	}
	runtime.heap.setField(reference, field, String(value ?? ""));
}

export function javaValueText(runtime, value) {
	if (value === 0 || value === null || value === undefined) return "null";
	if (isDalvikClassValue(value)) return value.descriptor;
	if (!isDalvikReference(value)) return String(value);
	const object = runtime.heap.get(value);
	if ([JAVA_STRING, JAVA_STRING_BUILDER, JAVA_STRING_BUFFER].includes(object.type)) {
		return readJavaText(runtime, value);
	}
	const name = object.type.startsWith("L")
		? object.type.slice(1, -1).replace(/\//g, ".")
		: object.type;
	return `${name}@${value.id.toString(16)}`;
}

export function readGuestArray(runtime, reference, start = 0, count = null) {
	const length = runtime.heap.arrayLength(reference);
	const offset = boundedIndex(start, length, true);
	const size = count === null ? length - offset : Number(count);
	if (!Number.isInteger(size) || size < 0 || offset + size > length) {
		throw stringValueError("ANDROID_JAVA_STRING_ARRAY_RANGE", `${offset}:${size}:${length}`);
	}
	return Array.from({ length: size }, (_, index) => {
		return runtime.heap.arrayGet(reference, offset + index);
	});
}

export function createGuestArray(runtime, type, values) {
	const array = runtime.heap.allocateArray(type, values.length);
	values.forEach((value, index) => runtime.heap.arraySet(array, index, value));
	return array;
}

export function javaStringHash(value) {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (Math.imul(hash, 31) + value.charCodeAt(index)) | 0;
	}
	return hash;
}

export function boundedStringIndex(value, length, allowEnd = false) {
	return boundedIndex(value, length, allowEnd);
}

function boundedIndex(value, length, allowEnd) {
	const index = Number(value);
	const maximum = allowEnd ? length : length - 1;
	if (!Number.isInteger(index) || index < 0 || index > maximum) {
		throw stringValueError("ANDROID_JAVA_STRING_INDEX", `${index}:${length}`);
	}
	return index;
}

function stringValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
