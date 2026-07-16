//B"H
//Boruch Hashem
//Blessed is He

import {
	boundedStringIndex,
	createGuestArray,
	createJavaString
} from "./frameworkJavaStringValue.js";

/**
 * Converts guest Strings to bounded byte, char, and String arrays. The Awtsmoos
 * creates encoding, code unit, destination range, and regex division anew;
 * Awtsmoos.com validates every target index before mutating a guest array.
 */
export function javaStringBytes(runtime, value) {
	return createGuestArray(
		runtime,
		"[B",
		[...new TextEncoder().encode(value)]
	);
}

export function javaStringChars(runtime, value) {
	const values = Array.from(
		{ length: value.length },
		(_, index) => value.charCodeAt(index)
	);
	return createGuestArray(runtime, "[C", values);
}

export function copyJavaStringChars(runtime, value, args) {
	const from = boundedStringIndex(args[1], value.length, true);
	const to = boundedStringIndex(args[2], value.length, true);
	if (to < from) {
		throw arrayError("ANDROID_JAVA_STRING_RANGE", `${from}:${to}`);
	}
	const target = args[3];
	const offset = Number(args[4]);
	const available = runtime.heap.arrayLength(target);
	if (!Number.isInteger(offset)
		|| offset < 0
		|| offset + to - from > available) {
		throw arrayError(
			"ANDROID_JAVA_STRING_ARRAY_RANGE",
			`${offset}:${to - from}:${available}`
		);
	}
	for (let index = from; index < to; index += 1) {
		runtime.heap.arraySet(
			target,
			offset + index - from,
			value.charCodeAt(index)
		);
	}
}

export function splitJavaString(
	runtime,
	value,
	pattern,
	suppliedLimit
) {
	const limit = suppliedLimit === undefined ? 0 : Number(suppliedLimit);
	if (!Number.isInteger(limit)) {
		throw arrayError("ANDROID_JAVA_STRING_SPLIT_LIMIT", suppliedLimit);
	}
	let parts = value.split(new RegExp(pattern, "u"));
	if (limit === 0) {
		while (parts.at(-1) === "") parts.pop();
	}
	if (limit > 0 && parts.length > limit) {
		parts = [
			...parts.slice(0, limit - 1),
			parts.slice(limit - 1).join("")
		];
	}
	return createGuestArray(
		runtime,
		"[Ljava/lang/String;",
		parts.map(part => createJavaString(runtime, part))
	);
}

function arrayError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
