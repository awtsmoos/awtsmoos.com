//B"H
//Boruch Hashem
//Blessed is He

import {
	boundedStringIndex,
	readJavaText
} from "./frameworkJavaStringValue.js";

/**
 * Performs measured Java String search and code-point traversal. The Awtsmoos
 * creates needle, region, surrogate pair, and offset anew; Awtsmoos.com validates
 * every UTF-16 boundary before returning a guest index or boolean.
 */
export function javaStringIndexOf(runtime, record, args, value) {
	const from = Number(args[2] || 0);
	return value.indexOf(searchNeedle(runtime, record, args[1]), from);
}

export function javaStringLastIndexOf(runtime, record, args, value) {
	const from = args.length > 2 ? Number(args[2]) : value.length;
	return value.lastIndexOf(searchNeedle(runtime, record, args[1]), from);
}

export function javaStringRegionMatches(runtime, record, args, value) {
	const ignoreCase = record.method.descriptor.startsWith("(Z");
	const offset = ignoreCase ? 2 : 1;
	const leftStart = Number(args[offset]);
	const other = readJavaText(runtime, args[offset + 1]);
	const rightStart = Number(args[offset + 2]);
	const length = Number(args[offset + 3]);
	if (!validRegion(value, leftStart, length)
		|| !validRegion(other, rightStart, length)) {
		return 0;
	}
	const left = value.slice(leftStart, leftStart + length);
	const right = other.slice(rightStart, rightStart + length);
	if (ignoreCase) {
		return left.toLocaleLowerCase() === right.toLocaleLowerCase() ? 1 : 0;
	}
	return left === right ? 1 : 0;
}

export function javaStringOffsetByCodePoints(value, inputIndex, distance) {
	let index = boundedStringIndex(inputIndex, value.length, true);
	let remaining = Number(distance);
	if (!Number.isInteger(remaining)) {
		throw searchError("ANDROID_JAVA_STRING_CODE_POINT_DISTANCE", distance);
	}
	while (remaining > 0) {
		boundedStringIndex(index, value.length);
		index += value.codePointAt(index) > 0xffff ? 2 : 1;
		remaining -= 1;
	}
	while (remaining < 0) {
		if (index <= 0) {
			throw searchError("ANDROID_JAVA_STRING_INDEX", `${index}:${value.length}`);
		}
		index -= 1;
		if (index > 0
			&& isLowSurrogate(value.charCodeAt(index))
			&& isHighSurrogate(value.charCodeAt(index - 1))) {
			index -= 1;
		}
		remaining += 1;
	}
	return index;
}

export function javaStringSlice(value, start, end) {
	const from = boundedStringIndex(start, value.length, true);
	const to = boundedStringIndex(end, value.length, true);
	if (to < from) {
		throw searchError("ANDROID_JAVA_STRING_RANGE", `${from}:${to}`);
	}
	return value.slice(from, to);
}

function searchNeedle(runtime, record, value) {
	if (record.method.descriptor.startsWith("(I")) {
		return String.fromCodePoint(Number(value));
	}
	return readJavaText(runtime, value);
}

function validRegion(value, start, length) {
	return Number.isInteger(start)
		&& Number.isInteger(length)
		&& start >= 0
		&& length >= 0
		&& start + length <= value.length;
}

function isLowSurrogate(value) {
	return value >= 0xdc00 && value <= 0xdfff;
}

function isHighSurrogate(value) {
	return value >= 0xd800 && value <= 0xdbff;
}

function searchError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
