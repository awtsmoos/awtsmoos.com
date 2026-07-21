//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";

export const JAVA_MATCHER = "Ljava/util/regex/Matcher;";
export const JAVA_PATTERN = "Ljava/util/regex/Pattern;";
const CURSOR_FIELD = "java:regex:cursor";
const FLAGS_FIELD = "java:regex:flags";
const LAST_FIELD = "java:regex:last";
const PATTERN_FIELD = "java:regex:pattern";
const SOURCE_FIELD = "java:regex:source";
const TEXT_FIELD = "java:regex:text";

/**
 * Stores Java regex source, matcher text, cursor, and immutable match evidence.
 *
 * The Awtsmoos recreates expression and result anew. Awtsmoos.com keeps host
 * RegExp instances transient and never places them inside guest-owned heap state.
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

export function createJavaMatcher(runtime, pattern, value) {
	runtime.heap.get(pattern);
	return runtime.heap.allocate(JAVA_MATCHER, {
		[CURSOR_FIELD]: 0,
		[LAST_FIELD]: null,
		[PATTERN_FIELD]: pattern,
		[TEXT_FIELD]: readGuestText(runtime, value)
	});
}

export function matcherRegex(runtime, matcher, options = {}) {
	const pattern = runtime.heap.getField(matcher, PATTERN_FIELD);
	const source = runtime.heap.getField(pattern, SOURCE_FIELD);
	const prefix = options.full || options.start ? "^(?:" : "(?:";
	const suffix = options.full ? ")$" : ")";
	const global = options.global ? "g" : "";
	return new RegExp(
		`${prefix}${source}${suffix}`,
		`${patternFlags(runtime, pattern)}${global}`
	);
}

export function matcherText(runtime, matcher) {
	return String(runtime.heap.getField(matcher, TEXT_FIELD) || "");
}

export function matcherCursor(runtime, matcher) {
	return Number(runtime.heap.getField(matcher, CURSOR_FIELD) || 0);
}

export function storeMatcherResult(runtime, matcher, match) {
	const stored = match ? Object.freeze({
		groups: Object.freeze([...match]),
		index: match.index
	}) : null;
	runtime.heap.setField(matcher, LAST_FIELD, stored);
	return stored;
}

export function requireMatcherResult(runtime, matcher) {
	const result = runtime.heap.getField(matcher, LAST_FIELD);
	if (!result) throw regexStateError("JAVA_REGEX_NO_MATCH", "matcher");
	return result;
}

export function setMatcherCursor(runtime, matcher, value) {
	runtime.heap.setField(matcher, CURSOR_FIELD, Number(value));
}

export function resetJavaMatcher(runtime, matcher, value) {
	if (value !== undefined) {
		runtime.heap.setField(matcher, TEXT_FIELD, readGuestText(runtime, value));
	}
	runtime.heap.setField(matcher, CURSOR_FIELD, 0);
	runtime.heap.setField(matcher, LAST_FIELD, null);
	return matcher;
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
		throw regexStateError("JAVA_REGEX_FLAGS_UNSUPPORTED", flags);
	}
}

function translateJavaRegex(value) {
	return String(value)
		.replace(/\\Q([\s\S]*?)\\E/g, (_, literal) => escapeJavaScriptRegex(literal))
		.replace(/\\z/g, "$")
		.replace(/\\A/g, "^");
}

function escapeJavaScriptRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function regexStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
