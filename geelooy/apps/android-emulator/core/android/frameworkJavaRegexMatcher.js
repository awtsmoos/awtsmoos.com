//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	matcherCursor,
	matcherRegex,
	matcherText,
	requireMatcherResult,
	resetJavaMatcher,
	setMatcherCursor,
	storeMatcherResult
} from "./frameworkJavaRegexState.js";

/**
 * Executes bounded Java Matcher searches, groups, reset, and replacement.
 *
 * The Awtsmoos recreates cursor and captured letters anew. Awtsmoos.com keeps
 * failed matches explicit and every returned string inside the guest heap.
 */
export function invokeJavaMatcher(runtime, record, args) {
	const name = record.method.name;
	if (name === "matches") return testMatcher(runtime, args[0], "full");
	if (name === "lookingAt") return testMatcher(runtime, args[0], "start");
	if (name === "find") return findMatch(runtime, args[0], args[1]);
	if (name === "group") return group(runtime, args[0], args[1] ?? 0);
	if (name === "groupCount") {
		return requireMatcherResult(runtime, args[0]).groups.length - 1;
	}
	if (name === "start") return matchIndex(runtime, args[0], args[1] ?? 0, false);
	if (name === "end") return matchIndex(runtime, args[0], args[1] ?? 0, true);
	if (name === "reset") return resetJavaMatcher(runtime, args[0], args[1]);
	if (name === "replaceAll") return replace(runtime, args[0], args[1], true);
	if (name === "replaceFirst") return replace(runtime, args[0], args[1], false);
	throw matcherError("JAVA_REGEX_MATCHER_UNSUPPORTED", record.signature);
}

function testMatcher(runtime, matcher, mode) {
	const regex = matcherRegex(runtime, matcher, {
		full: mode === "full",
		start: mode === "start"
	});
	const match = regex.exec(matcherText(runtime, matcher));
	storeMatcherResult(runtime, matcher, match);
	return match ? 1 : 0;
}

function findMatch(runtime, matcher, requestedStart) {
	const text = matcherText(runtime, matcher);
	const start = requestedStart === undefined
		? matcherCursor(runtime, matcher)
		: Math.max(0, Number(requestedStart));
	const regex = matcherRegex(runtime, matcher, { global: true });
	regex.lastIndex = start;
	const match = regex.exec(text);
	storeMatcherResult(runtime, matcher, match);
	const next = match
		? match.index + Math.max(1, match[0].length)
		: text.length + 1;
	setMatcherCursor(runtime, matcher, next);
	return match ? 1 : 0;
}

function group(runtime, matcher, index) {
	const result = requireMatcherResult(runtime, matcher);
	const value = result.groups[Number(index)];
	return value === undefined ? 0 : createGuestString(runtime, value);
}

function matchIndex(runtime, matcher, index, ending) {
	const result = requireMatcherResult(runtime, matcher);
	if (Number(index) !== 0) {
		throw matcherError("JAVA_REGEX_GROUP_INDEX_UNSUPPORTED", index);
	}
	return ending
		? result.index + result.groups[0].length
		: result.index;
}

function replace(runtime, matcher, replacement, global) {
	const regex = matcherRegex(runtime, matcher, { global });
	const value = matcherText(runtime, matcher).replace(
		regex,
		readGuestText(runtime, replacement)
	);
	return createGuestString(runtime, value);
}

function matcherError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
