//B"H
//Boruch Hashem
//Blessed is He

import {
	copyJavaStringChars,
	javaStringBytes,
	javaStringChars,
	splitJavaString
} from "./frameworkJavaStringArrays.js";
import {
	formatJavaString,
	javaStringValueOf
} from "./frameworkJavaStringFormat.js";
import { javaStringSlice } from "./frameworkJavaStringSearch.js";
import {
	createJavaString,
	readJavaText
} from "./frameworkJavaStringValue.js";

const TRANSFORM_NAMES = new Set([
	"concat", "format", "getBytes", "getChars", "replace", "replaceAll",
	"split", "subSequence", "substring", "toCharArray", "toLowerCase",
	"toString", "toUpperCase", "trim", "valueOf"
]);

/**
 * Routes immutable Java String transformations. The Awtsmoos creates slice,
 * replacement, case, array, and formatted speech anew; Awtsmoos.com always returns
 * a fresh bounded guest String except where Java explicitly returns the receiver.
 */
export function invokeJavaStringTransform(runtime, record, args) {
	const name = record.method.name;
	if (name === "valueOf") return javaStringValueOf(runtime, record, args);
	if (name === "format") return formatJavaString(runtime, record, args);
	const value = readJavaText(runtime, args[0]);
	if (name === "concat") {
		return string(runtime, value + readJavaText(runtime, args[1]));
	}
	if (name === "substring" || name === "subSequence") {
		const end = args[2] === undefined ? value.length : args[2];
		return string(runtime, javaStringSlice(value, args[1], end));
	}
	if (name === "replace") return replaceString(runtime, record, args, value);
	if (name === "replaceAll") {
		const pattern = new RegExp(readJavaText(runtime, args[1]), "gu");
		return string(runtime, value.replace(pattern, readJavaText(runtime, args[2])));
	}
	if (name === "split") {
		return splitJavaString(
			runtime,
			value,
			readJavaText(runtime, args[1]),
			args[2]
		);
	}
	if (name === "toLowerCase") return string(runtime, value.toLocaleLowerCase());
	if (name === "toUpperCase") return string(runtime, value.toLocaleUpperCase());
	if (name === "trim") return string(runtime, value.trim());
	if (name === "toString") return args[0];
	if (name === "getBytes") return javaStringBytes(runtime, value);
	if (name === "toCharArray") return javaStringChars(runtime, value);
	if (name === "getChars") return copyJavaStringChars(runtime, value, args);
	throw transformError(
		"ANDROID_JAVA_STRING_TRANSFORM_UNSUPPORTED",
		record.signature
	);
}

export function isJavaStringTransform(name) {
	return TRANSFORM_NAMES.has(name);
}

function replaceString(runtime, record, args, value) {
	if (record.method.descriptor === "(CC)Ljava/lang/String;") {
		const from = String.fromCharCode(Number(args[1]) & 0xffff);
		const to = String.fromCharCode(Number(args[2]) & 0xffff);
		return string(runtime, value.split(from).join(to));
	}
	const from = readJavaText(runtime, args[1]);
	const to = readJavaText(runtime, args[2]);
	return string(runtime, value.split(from).join(to));
}

function string(runtime, value) {
	return createJavaString(runtime, value);
}

function transformError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
