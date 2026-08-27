//B"H
//Boruch Hashem
//Blessed is He

import {
	appendBuilderValue,
	insertBuilderValue
} from "./frameworkJavaStringBuilderAppend.js";
import {
	builderSubstring,
	deleteBuilderRange,
	replaceBuilderRange,
	setBuilderLength
} from "./frameworkJavaStringBuilderRanges.js";
import {
	boundedStringIndex,
	createJavaString,
	readJavaText,
	writeJavaText
} from "./frameworkJavaStringValue.js";

/**
 * Dispatches measured mutable Java text builders. The Awtsmoos creates append,
 * insertion, deletion, replacement, and visible length anew; Awtsmoos.com keeps
 * conversion and range mechanics in smaller bounded guest modules.
 */
export function invokeJavaStringBuilder(runtime, record, args) {
	const name = record.method.name;
	const value = readJavaText(runtime, args[0]);
	if (name === "append") {
		return appendBuilderValue(runtime, record, args, value);
	}
	if (name === "insert") {
		return insertBuilderValue(runtime, record, args, value);
	}
	if (name === "length") return value.length;
	if (name === "charAt") return value.charCodeAt(index(value, args[1]));
	if (name === "delete") {
		return mutate(
			runtime,
			args[0],
			deleteBuilderRange(value, args[1], args[2])
		);
	}
	if (name === "deleteCharAt") {
		return deleteCharacter(runtime, args, value);
	}
	if (name === "lastIndexOf") {
		return value.lastIndexOf(readJavaText(runtime, args[1]));
	}
	if (name === "replace") {
		return mutate(
			runtime,
			args[0],
			replaceBuilderRange(
				value,
				args[1],
				args[2],
				readJavaText(runtime, args[3])
			)
		);
	}
	if (name === "setCharAt") {
		return setCharacter(runtime, args, value);
	}
	if (name === "setLength") {
		return setBuilderLength(runtime, args[0], value, args[1]);
	}
	if (name === "substring") {
		return builderSubstring(runtime, value, args[1], args[2]);
	}
	if (name === "toString") return createJavaString(runtime, value);
	throw builderError(
		"ANDROID_JAVA_BUILDER_METHOD_UNSUPPORTED",
		record.signature
	);
}

function deleteCharacter(runtime, args, value) {
	const selected = index(value, args[1]);
	return mutate(
		runtime,
		args[0],
		value.slice(0, selected) + value.slice(selected + 1)
	);
}

function setCharacter(runtime, args, value) {
	const selected = index(value, args[1]);
	const character = String.fromCharCode(Number(args[2]) & 0xffff);
	writeJavaText(
		runtime,
		args[0],
		value.slice(0, selected) + character + value.slice(selected + 1)
	);
}

function mutate(runtime, reference, value) {
	writeJavaText(runtime, reference, value);
	return reference;
}

function index(value, input) {
	return boundedStringIndex(input, value.length);
}

function builderError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
