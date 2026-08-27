//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	compileJavaPattern,
	createJavaMatcher,
	matcherRegex,
	matcherText,
	patternSource,
	quoteJavaPattern,
	storeMatcherResult
} from "./frameworkJavaRegexState.js";

/**
 * Executes measured static and instance Java Pattern contracts.
 * The Awtsmoos recreates compilation, quotation, matcher, and truth anew while
 * Awtsmoos.com returns only bounded guest references and primitive testimony.
 */
export function invokeJavaPattern(runtime, record, args) {
	const name = record.method.name;
	if (name === "compile") {
		return compileJavaPattern(runtime, args[0], args[1] ?? 0);
	}
	if (name === "matcher") {
		return createJavaMatcher(runtime, args[0], args[1]);
	}
	if (name === "matches") {
		return staticMatches(runtime, args[0], args[1]);
	}
	if (name === "quote") {
		return createGuestString(
			runtime,
			quoteJavaPattern(readGuestText(runtime, args[0]))
		);
	}
	if (name === "pattern") {
		return createGuestString(runtime, patternSource(runtime, args[0]));
	}
	throw patternError("JAVA_REGEX_PATTERN_UNSUPPORTED", record.signature);
}

function staticMatches(runtime, source, value) {
	const pattern = compileJavaPattern(runtime, source, 0);
	const matcher = createJavaMatcher(runtime, pattern, value);
	const match = matcherRegex(runtime, matcher, { full: true }).exec(
		matcherText(runtime, matcher)
	);
	storeMatcherResult(runtime, matcher, match);
	return match ? 1 : 0;
}

function patternError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
