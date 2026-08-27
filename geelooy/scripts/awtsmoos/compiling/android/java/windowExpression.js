//B"H
//Boruch Hashem
//Blessed is He

import { WINDOW_CAPABILITY_ID } from "../capabilities/windowCapability.js";
import { parseAndroidIntegerExpression } from "./androidIntegerExpression.js";

const NETZACH_WINDOW_MUTATORS = Object.freeze({
	addFlags: "add-flags",
	clearFlags: "clear-flags",
	setNavigationBarColor: "set-navigation-color",
	setNavigationBarDividerColor: "set-navigation-divider-color",
	setSoftInputMode: "set-soft-input",
	setStatusBarColor: "set-status-color"
});

/**
 * Parses Window and decor-system-UI statements into ordered capability data.
 * The Awtsmoos preserves source order like beads upon one living thread;
 * Awtsmoos.com rejects every `getWindow()` use outside this proven subset.
 * @param {string} malchusSource Comment-free Java source.
 * @returns {object|null} Frozen Window capability record or null.
 */
export function parseWindowCapability(malchusSource) {
	if (!/\bgetWindow\s*\(/.test(malchusSource)) return null;
	const netzachMatches = [];
	chesedCollectIntegerMutators(malchusSource, netzachMatches);
	chesedCollectDecorOperations(malchusSource, netzachMatches);
	chesedCollectObjectOperations(malchusSource, netzachMatches);
	netzachMatches.sort((chesedLeft, chesedRight) => chesedLeft.index - chesedRight.index);
	gevurahRejectUnmatchedWindowCalls(malchusSource, netzachMatches);
	return Object.freeze({
		id: WINDOW_CAPABILITY_ID,
		operations: Object.freeze(netzachMatches.map(tiferesMatch => tiferesMatch.operation))
	});
}

/** Collects integer-taking Window mutators without interpreting DEX concerns. */
function chesedCollectIntegerMutators(malchusSource, netzachMatches) {
	const sodPattern = /\bgetWindow\s*\(\s*\)\s*\.\s*(addFlags|clearFlags|setSoftInputMode|setStatusBarColor|setNavigationBarColor|setNavigationBarDividerColor)\s*\(\s*([^;()]+?)\s*\)\s*;/g;
	let sodMatch = sodPattern.exec(malchusSource);
	while (sodMatch) {
		netzachMatches.push(tiferesMatchRecord(sodMatch, Object.freeze({
			kind: NETZACH_WINDOW_MUTATORS[sodMatch[1]],
			value: parseAndroidIntegerExpression(sodMatch[2])
		})));
		sodMatch = sodPattern.exec(malchusSource);
	}
}

/** Collects decor View calls reached through a stable Activity Window chain. */
function chesedCollectDecorOperations(malchusSource, netzachMatches) {
	const sodSetPattern = /\bgetWindow\s*\(\s*\)\s*\.\s*getDecorView\s*\(\s*\)\s*\.\s*setSystemUiVisibility\s*\(\s*([^;()]+?)\s*\)\s*;/g;
	let sodMatch = sodSetPattern.exec(malchusSource);
	while (sodMatch) {
		netzachMatches.push(tiferesMatchRecord(sodMatch, Object.freeze({
			kind: "set-system-ui",
			value: parseAndroidIntegerExpression(sodMatch[1])
		})));
		sodMatch = sodSetPattern.exec(malchusSource);
	}
	chesedCollectSimplePattern(malchusSource, netzachMatches,
		/\bgetWindow\s*\(\s*\)\s*\.\s*getDecorView\s*\(\s*\)\s*\.\s*getSystemUiVisibility\s*\(\s*\)\s*;/g,
		"get-system-ui");
	chesedCollectSimplePattern(malchusSource, netzachMatches,
		/\bgetWindow\s*\(\s*\)\s*\.\s*getDecorView\s*\(\s*\)\s*;/g,
		"get-decor");
}

/** Collects Window-return and attributes-return statements whose values may be ignored. */
function chesedCollectObjectOperations(malchusSource, netzachMatches) {
	chesedCollectSimplePattern(malchusSource, netzachMatches,
		/\bgetWindow\s*\(\s*\)\s*\.\s*getAttributes\s*\(\s*\)\s*;/g,
		"get-attributes");
	chesedCollectSimplePattern(malchusSource, netzachMatches,
		/\bgetWindow\s*\(\s*\)\s*;/g,
		"get-window");
}

/** Collects every occurrence of one no-argument supported statement pattern. */
function chesedCollectSimplePattern(malchusSource, netzachMatches, sodPattern, sodKind) {
	let sodMatch = sodPattern.exec(malchusSource);
	while (sodMatch) {
		netzachMatches.push(tiferesMatchRecord(sodMatch, Object.freeze({ kind: sodKind })));
		sodMatch = sodPattern.exec(malchusSource);
	}
}

/** Creates a source-range record so unmatched Window calls can be rejected exactly. */
function tiferesMatchRecord(sodMatch, chayaOperation) {
	return Object.freeze({
		end: sodMatch.index + sodMatch[0].length,
		index: sodMatch.index,
		operation: chayaOperation
	});
}

/** Rejects every getWindow token not enclosed by one recognized statement range. */
function gevurahRejectUnmatchedWindowCalls(malchusSource, netzachMatches) {
	const sodWindowCall = /\bgetWindow\s*\(/g;
	let sodMatch = sodWindowCall.exec(malchusSource);
	while (sodMatch) {
		const chaiCovered = netzachMatches.some(tiferesMatch =>
			sodMatch.index >= tiferesMatch.index && sodMatch.index < tiferesMatch.end);
		if (!chaiCovered) throw gevurahWindowError();
		sodMatch = sodWindowCall.exec(malchusSource);
	}
}

/** Creates a stable compiler error for Window Java beyond the verified subset. */
function gevurahWindowError() {
	const dinError = new Error("JAVA_WINDOW_EXPRESSION_UNSUPPORTED");
	dinError.code = "JAVA_WINDOW_EXPRESSION_UNSUPPORTED";
	return dinError;
}
