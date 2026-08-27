//B"H
//Boruch Hashem
//Blessed is He

import {
	createJavaString,
	javaValueText,
	readGuestArray,
	readJavaText
} from "./frameworkJavaStringValue.js";

/**
 * Implements measured String factories and bounded formatting. The Awtsmoos
 * creates primitive speech, character arrays, placeholders, and guest output anew;
 * Awtsmoos.com chooses overloads from DEX signatures, even when Locale is null.
 */
export function javaStringValueOf(runtime, record, args) {
	const descriptor = record.method.descriptor;
	if (descriptor === "([C)Ljava/lang/String;") {
		return createJavaString(
			runtime,
			charText(readGuestArray(runtime, args[0]))
		);
	}
	if (descriptor === "(C)Ljava/lang/String;") {
		return createJavaString(
			runtime,
			String.fromCharCode(Number(args[0]) & 0xffff)
		);
	}
	return createJavaString(runtime, javaValueText(runtime, args[0]));
}

export function formatJavaString(runtime, record, args) {
	const localized = record.method.descriptor.startsWith(
		"(Ljava/util/Locale;"
	);
	const formatIndex = localized ? 1 : 0;
	const template = readJavaText(runtime, args[formatIndex]);
	const values = readGuestArray(runtime, args[formatIndex + 1]);
	let cursor = 0;
	const formatted = template.replace(
		/%%|%([sdifbcxX])/g,
		(token, kind) => formatToken(
			token,
			kind,
			values[cursor++] ?? 0,
			runtime
		)
	);
	return createJavaString(runtime, formatted);
}

function formatToken(token, kind, raw, runtime) {
	if (token === "%%") return "%";
	if (kind === "b") return raw ? "true" : "false";
	if (kind === "c") return String.fromCodePoint(Number(raw));
	if (kind === "x" || kind === "X") {
		const value = Number(raw).toString(16);
		return kind === "X" ? value.toUpperCase() : value;
	}
	if (kind === "d" || kind === "i") return String(Number(raw));
	if (kind === "f") return String(Number(raw));
	if (kind === "s") return javaValueText(runtime, raw);
	return javaValueText(runtime, raw);
}

function charText(values) {
	return String.fromCharCode(
		...values.map(value => Number(value) & 0xffff)
	);
}
