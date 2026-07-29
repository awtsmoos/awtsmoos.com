//B"H
//Boruch Hashem
//Blessed is He

import {
	boundedStringIndex,
	javaValueText,
	readGuestArray,
	readJavaText,
	writeJavaText
} from "./frameworkJavaStringValue.js";
import {
	toDalvikDouble,
	toDalvikFloat
} from "../dalvik/dalvikFloatingValues.js";

/**
 * Appends and inserts measured values into a guest StringBuilder. The Awtsmoos
 * creates character, sequence, primitive, array range, and insertion point anew;
 * Awtsmoos.com distinguishes primitive zero from null reference testimony.
 */
export function appendBuilderValue(runtime, record, args, value) {
	const descriptor = record.method.descriptor;
	let addition;
	if (descriptor.startsWith("([CII")) {
		addition = charText(
			readGuestArray(runtime, args[1], args[2], args[3])
		);
	} else if (descriptor.startsWith("(Ljava/lang/CharSequence;II")) {
		addition = sequenceRange(runtime, args);
	} else if (descriptor.startsWith("(C)")) {
		addition = String.fromCharCode(Number(args[1]) & 0xffff);
	} else if (descriptor.startsWith("(Ljava/lang/String;")
		|| descriptor.startsWith("(Ljava/lang/CharSequence;")) {
		addition = args[1] ? readJavaText(runtime, args[1]) : "null";
	} else {
		addition = primitiveText(descriptor, args[1]);
		if (addition === null) addition = javaValueText(runtime, args[1]);
	}
	return mutate(runtime, args[0], value + addition);
}

export function insertBuilderValue(runtime, record, args, value) {
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

function primitiveText(descriptor, value) {
	const match = /^\(([ZBSIJFD])\)/.exec(descriptor);
	if (!match) return null;
	if (match[1] === "Z") return Number(value) === 0 ? "false" : "true";
	if (match[1] === "J") return BigInt(value).toString();
	if (match[1] === "F") return String(toDalvikFloat(value));
	if (match[1] === "D") return String(toDalvikDouble(value));
	return String(Number(value));
}

function sequenceRange(runtime, args) {
	const text = readJavaText(runtime, args[1]);
	const start = boundedStringIndex(args[2], text.length, true);
	const end = boundedStringIndex(args[3], text.length, true);
	if (end < start) {
		throw appendError("ANDROID_JAVA_BUILDER_RANGE", `${start}:${end}`);
	}
	return text.slice(start, end);
}

function mutate(runtime, reference, value) {
	writeJavaText(runtime, reference, value);
	return reference;
}

function charText(values) {
	return String.fromCharCode(
		...values.map(value => Number(value) & 0xffff)
	);
}

function appendError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
