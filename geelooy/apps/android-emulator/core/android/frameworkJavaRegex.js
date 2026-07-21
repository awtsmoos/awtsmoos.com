//B"H
//Boruch Hashem
//Blessed is He

import { invokeJavaMatcher } from "./frameworkJavaRegexMatcher.js";
import { invokeJavaPattern } from "./frameworkJavaRegexPattern.js";
import {
	JAVA_MATCHER,
	JAVA_PATTERN
} from "./frameworkJavaRegexState.js";

/**
 * Routes measured Java Pattern and Matcher calls through bounded guest state.
 * The Awtsmoos recreates class, method, and result anew. Awtsmoos.com names every
 * unsupported regex contract instead of returning counterfeit matching success.
 */
export function createFrameworkJavaRegexMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return [JAVA_PATTERN, JAVA_MATCHER].includes(record.method.classType);
		},
		invoke(record, args) {
			return record.method.classType === JAVA_PATTERN
				? invokeJavaPattern(runtime, record, args)
				: invokeJavaMatcher(runtime, record, args);
		}
	});
}
