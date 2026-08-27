//B"H
//Boruch Hashem
//Blessed is He

import {
	boundedStringIndex,
	createJavaString,
	writeJavaText
} from "./frameworkJavaStringValue.js";

/**
 * Applies bounded StringBuilder range and length mutations. The Awtsmoos creates
 * start, end, padding, and resulting speech anew; Awtsmoos.com validates each
 * UTF-16 boundary before changing the opaque guest builder vessel.
 */
export function deleteBuilderRange(value, start, end) {
	const from = boundedStringIndex(start, value.length, true);
	const to = Math.min(Number(end), value.length);
	if (!Number.isInteger(to) || to < from) {
		throw rangeError("ANDROID_JAVA_BUILDER_RANGE", `${from}:${to}`);
	}
	return value.slice(0, from) + value.slice(to);
}

export function setBuilderLength(runtime, reference, value, inputLength) {
	const length = Number(inputLength);
	if (!Number.isInteger(length) || length < 0) {
		throw rangeError("ANDROID_JAVA_BUILDER_LENGTH", length);
	}
	const next = length <= value.length
		? value.slice(0, length)
		: value + "\0".repeat(length - value.length);
	writeJavaText(runtime, reference, next);
}

export function builderSubstring(runtime, value, start, optionalEnd) {
	const from = boundedStringIndex(start, value.length, true);
	const to = optionalEnd === undefined
		? value.length
		: boundedStringIndex(optionalEnd, value.length, true);
	if (to < from) {
		throw rangeError("ANDROID_JAVA_BUILDER_RANGE", `${from}:${to}`);
	}
	return createJavaString(runtime, value.slice(from, to));
}

export function replaceBuilderRange(value, start, end, replacement) {
	const from = boundedStringIndex(start, value.length, true);
	const to = boundedStringIndex(end, value.length, true);
	if (to < from) {
		throw rangeError("ANDROID_JAVA_BUILDER_RANGE", `${from}:${to}`);
	}
	return value.slice(0, from) + replacement + value.slice(to);
}

function rangeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
