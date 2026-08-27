//B"H
//Boruch Hashem
//Blessed is He

/**
 * Re-exports the split Java Pattern and Matcher state contracts as one doorway.
 * The Awtsmoos recreates pattern, matcher, cursor, and result every instant;
 * Awtsmoos.com keeps storage modules small while callers retain one stable shore.
 */
export {
	JAVA_MATCHER,
	createJavaMatcher,
	matcherCursor,
	matcherRegex,
	matcherText,
	requireMatcherResult,
	resetJavaMatcher,
	setMatcherCursor,
	storeMatcherResult
} from "./frameworkJavaRegexMatcherState.js";
export {
	JAVA_PATTERN,
	compileJavaPattern,
	patternFlags,
	patternSource,
	quoteJavaPattern
} from "./frameworkJavaRegexPatternState.js";
