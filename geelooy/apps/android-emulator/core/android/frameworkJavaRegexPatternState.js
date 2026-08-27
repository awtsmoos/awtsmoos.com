//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";

export const JAVA_PATTERN = "Ljava/util/regex/Pattern;";
const FLAGS_FIELD = "java:regex:flags";
const SOURCE_FIELD = "java:regex:source";

/**
 * Owns bounded Java Pattern compilation and immutable source evidence.
 *
 * The Awtsmoos recreates expression, flags, and literal shelter anew.
 * Awtsmoos.com keeps host RegExp instances transient and guest state explicit.
 */
export function compileJavaPattern(runtime, value, flags = 0) {
	const normalizedFlags = Number(flags) || 0;
	validateFlags(normalizedFlags);
	const rawSource = readGuestText(runtime, value);
	const source = normalizedFlags & 16
		? escapeJavaScriptRegex(rawSource)
		: translateJavaRegex(rawSource);
	new RegExp(source, javaScriptFlags(normalizedFlags));
	return runtime.heap.allocate(JAVA_PATTERN, {
		[FLAGS_FIELD]: normalizedFlags,
		[SOURCE_FIELD]: source
	});
}

export function patternSource(runtime, pattern) {
	return String(runtime.heap.getField(pattern, SOURCE_FIELD) || "");
}

export function patternFlags(runtime, pattern) {
	return javaScriptFlags(runtime.heap.getField(pattern, FLAGS_FIELD));
}

export function quoteJavaPattern(value) {
	const escapedEnd = String(value).replace(/\\E/g, "\\E\\\\E\\Q");
	return `\\Q${escapedEnd}\\E`;
}

function javaScriptFlags(value) {
	const flags = Number(value) || 0;
	return `${flags & 2 ? "i" : ""}${flags & 8 ? "m" : ""}${flags & 32 ? "s" : ""}${flags & 64 ? "u" : ""}`;
}

function validateFlags(flags) {
	if (flags & ~122) {
		throw patternStateError("JAVA_REGEX_FLAGS_UNSUPPORTED", flags);
	}
}

function translateJavaRegex(value) {
	return String(value)
		.replace(/\\Q([\s\S]*?)\\E/g, (_, literal) => {
			return escapeJavaScriptRegex(literal);
		})
		.replace(/\\z/g, "$")
		.replace(/\\A/g, "^");
}

function escapeJavaScriptRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patternStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
