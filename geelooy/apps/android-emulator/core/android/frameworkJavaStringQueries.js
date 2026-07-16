//B"H
//Boruch Hashem
//Blessed is He

import {
	javaStringHash,
	readJavaText
} from "./frameworkJavaStringValue.js";
import {
	javaStringIndexOf,
	javaStringLastIndexOf,
	javaStringOffsetByCodePoints,
	javaStringRegionMatches,
	javaStringSlice
} from "./frameworkJavaStringSearch.js";

const QUERY_NAMES = new Set([
	"charAt", "chars", "codePointAt", "codePointCount", "codePoints",
	"compareTo", "contains", "contentEquals", "endsWith", "equals",
	"equalsIgnoreCase", "hashCode", "indexOf", "isEmpty", "lastIndexOf",
	"length", "matches", "offsetByCodePoints", "regionMatches", "startsWith"
]);

/**
 * Answers measured Java String and CharSequence queries. The Awtsmoos creates
 * length, equality, search, code unit, and stream snapshot anew; Awtsmoos.com
 * returns only primitives or bounded guest stream vessels.
 */
export function invokeJavaStringQuery(runtime, record, args) {
	const name = record.method.name;
	const value = readJavaText(runtime, args[0]);
	if (name === "length") return value.length;
	if (name === "isEmpty") return value.length === 0 ? 1 : 0;
	if (name === "charAt") return value.charCodeAt(validIndex(value, args[1]));
	if (name === "codePointAt") return value.codePointAt(validIndex(value, args[1]));
	if (name === "codePointCount") {
		return [...javaStringSlice(value, args[1], args[2])].length;
	}
	if (name === "offsetByCodePoints") {
		return javaStringOffsetByCodePoints(value, args[1], args[2]);
	}
	if (name === "compareTo") return compare(value, text(runtime, args[1]));
	if (name === "equals") return equals(runtime, value, args[1]) ? 1 : 0;
	if (name === "equalsIgnoreCase") {
		return lower(value) === lower(text(runtime, args[1])) ? 1 : 0;
	}
	if (["contains", "contentEquals"].includes(name)) {
		return value.includes(text(runtime, args[1])) ? 1 : 0;
	}
	if (name === "startsWith") {
		return value.startsWith(text(runtime, args[1]), Number(args[2] || 0)) ? 1 : 0;
	}
	if (name === "endsWith") {
		return value.endsWith(text(runtime, args[1])) ? 1 : 0;
	}
	if (name === "indexOf") return javaStringIndexOf(runtime, record, args, value);
	if (name === "lastIndexOf") {
		return javaStringLastIndexOf(runtime, record, args, value);
	}
	if (name === "regionMatches") {
		return javaStringRegionMatches(runtime, record, args, value);
	}
	if (name === "hashCode") return javaStringHash(value);
	if (name === "matches") {
		return new RegExp(`^(?:${text(runtime, args[1])})$`, "u").test(value) ? 1 : 0;
	}
	if (name === "chars") return intStream(runtime, utf16Units(value));
	if (name === "codePoints") {
		return intStream(runtime, [...value].map(character => character.codePointAt(0)));
	}
	throw queryError("ANDROID_JAVA_STRING_QUERY_UNSUPPORTED", record.signature);
}

export function isJavaStringQuery(name) {
	return QUERY_NAMES.has(name);
}

function validIndex(value, input) {
	const index = Number(input);
	if (!Number.isInteger(index) || index < 0 || index >= value.length) {
		throw queryError("ANDROID_JAVA_STRING_INDEX", `${index}:${value.length}`);
	}
	return index;
}

function utf16Units(value) {
	return Array.from({ length: value.length }, (_, index) => value.charCodeAt(index));
}

function intStream(runtime, values) {
	return runtime.heap.allocate("Ljava/util/stream/IntStream;", {
		"java:int-stream:values": values
	});
}

function text(runtime, value) {
	return readJavaText(runtime, value);
}

function equals(runtime, value, other) {
	try {
		return value === readJavaText(runtime, other);
	} catch {
		return false;
	}
}

function lower(value) {
	return value.toLocaleLowerCase();
}

function compare(left, right) {
	return left === right ? 0 : left < right ? -1 : 1;
}

function queryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
