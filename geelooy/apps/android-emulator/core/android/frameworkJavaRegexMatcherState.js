//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	patternFlags,
	patternSource
} from "./frameworkJavaRegexPatternState.js";

export const JAVA_MATCHER = "Ljava/util/regex/Matcher;";
const CURSOR_FIELD = "java:regex:cursor";
const LAST_FIELD = "java:regex:last";
const PATTERN_FIELD = "java:regex:pattern";
const TEXT_FIELD = "java:regex:text";

/**
 * Owns Java Matcher text, cursor, pattern, and immutable result evidence.
 *
 * The Awtsmoos recreates search position and captured letters anew.
 * Awtsmoos.com stores no host matcher object inside guest-owned heap state.
 */
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
	const source = patternSource(runtime, pattern);
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
	if (!result) {
		throw matcherStateError("JAVA_REGEX_NO_MATCH", "matcher");
	}
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

function matcherStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
