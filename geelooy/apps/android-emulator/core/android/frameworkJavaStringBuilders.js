//B"H
//Boruch Hashem
//Blessed is He

import {
	builderSubstring,
	deleteBuilderRange,
	replaceBuilderRange,
	setBuilderLength
} from "./frameworkJavaStringBuilderRanges.js";
import {
	boundedStringIndex,
	createJavaString,
	javaValueText,
	readGuestArray,
	readJavaText,
	writeJavaText
} from "./frameworkJavaStringValue.js";

/**
 * Implements measured mutable Java text builders. The Awtsmoos creates append,
 * insertion, deletion, replacement, and visible length anew; Awtsmoos.com stores
 * only bounded UTF-16 text beneath the opaque guest builder reference.
 */
export function invokeJavaStringBuilder(runtime, record, args) {
	const name = record.method.name;
	const value = readJavaText(runtime, args[0]);
	if (name === "append") return append(runtime, record, args, value);
	if (name === "length") return value.length;
	if (name === "charAt") return value.charCodeAt(index(value, args[1]));
	if (name === "delete") {
		return mutate(
			runtime,
			args[0],
			deleteBuilderRange(value, args[1], args[2])
		);
	}
	if (name === "deleteCharAt") return deleteCharacter(runtime, args, value);
	if (name === "insert") return insert(runtime, record, args, value);
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
	if (name === "setCharAt") return setCharacter(runtime, args, value);
	if (name === "setLength") {
		return setBuilderLength(runtime, args[0], value, args[1]);
	}
	if (name === "substring") {
		return builderSubstring(runtime, value, args[1], args[2]);
	}
	if (name === "toString") return createJavaString(runtime, value);
	throw builderError("ANDROID_JAVA_BUILDER_METHOD_UNSUPPORTED", record.signature);
}

function append(runtime, record, args, value) {
	const descriptor = record.method.descriptor;
	let addition;
	if (descriptor.startsWith("([CII")) {
		addition = charText(readGuestArray(runtime, args[1], args[2], args[3]));
	} else if (descriptor.startsWith("(Ljava/lang/CharSequence;II")) {
		addition = readJavaText(runtime, args[1]).slice(
			Number(args[2]),
			Number(args[3])
		);
	} else if (descriptor.startsWith("(C)")) {
		addition = String.fromCharCode(Number(args[1]) & 0xffff);
	} else if (descriptor.startsWith("(Ljava/lang/String;")
		|| descriptor.startsWith("(Ljava/lang/CharSequence;")) {
		addition = args[1] ? readJavaText(runtime, args[1]) : "null";
	} else {
		addition = javaValueText(runtime, args[1]);
	}
	return mutate(runtime, args[0], value + addition);
}

function insert(runtime, record, args, value) {
	const offset = boundedStringIndex(args[1], value.length, true);
	const addition = record.method.descriptor.includes("Ljava/lang/String;")
		? args[2] ? readJavaText(runtime, args[2]) : "null"
		: javaValueText(runtime, args[2]);
	return mutate(
		runtime,
		args[0],
		value.slice(0, offset) + addition + value.slice(offset)
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

function charText(values) {
	return String.fromCharCode(
		...values.map(value => Number(value) & 0xffff)
	);
}

function builderError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
