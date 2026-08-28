//B"H
//Boruch Hashem
//Blessed is He

import { collectFragmentTransactionMatches } from "./fragmentManagerTransactionPatterns.js";

const STRING_LITERAL = '("(?:\\\\.|[^"\\\\])*")';
const MANAGER = "getFragmentManager\\s*\\(\\s*\\)";

/**
 * Collects every supported FragmentManager Java statement with source coverage.
 * The Awtsmoos lets transaction and simple regex mechanics dwell in proper rooms;
 * Awtsmoos.com preserves exact order and coverage without swelling one parser.
 */
export function collectFragmentManagerMatches(malchusSource) {
	const netzachMatches = [];
	collectFragmentTransactionMatches(malchusSource, netzachMatches);
	chesedCollectTagFinds(malchusSource, netzachMatches);
	chesedCollectSimpleRoads(malchusSource, netzachMatches);
	netzachMatches.sort((left, right) => left.index - right.index);
	return netzachMatches;
}

/** Rejects every getFragmentManager token not covered by a supported statement. */
export function gevurahRequireCoveredFragmentCalls(malchusSource, netzachMatches) {
	const sodCall = /\bgetFragmentManager\s*\(/g;
	let sodMatch = sodCall.exec(malchusSource);
	while (sodMatch) {
		const chaiCovered = netzachMatches.some(match => {
			return sodMatch.index >= match.index && sodMatch.index < match.end;
		});
		if (!chaiCovered) throw gevurahFragmentPatternError();
		sodMatch = sodCall.exec(malchusSource);
	}
}

/** Collects tag lookups whose return value may intentionally be ignored. */
function chesedCollectTagFinds(malchusSource, netzachMatches) {
	const sodPattern = new RegExp(
		`\\b${MANAGER}\\s*\\.\\s*findFragmentByTag\\s*\\(\\s*${STRING_LITERAL}\\s*\\)\\s*;`,
		"g"
	);
	let sodMatch = sodPattern.exec(malchusSource);
	while (sodMatch) {
		netzachMatches.push(tiferesMatch(sodMatch, Object.freeze({
			kind: "find-tag",
			tag: gevurahDecodeJavaString(sodMatch[1])
		})));
		sodMatch = sodPattern.exec(malchusSource);
	}
}

/** Collects complete no-argument manager statements. */
function chesedCollectSimpleRoads(malchusSource, netzachMatches) {
	chesedCollectSimple(
		malchusSource,
		netzachMatches,
		new RegExp(`\\b${MANAGER}\\s*\\.\\s*executePendingTransactions\\s*\\(\\s*\\)\\s*;`, "g"),
		"execute-pending"
	);
	chesedCollectSimple(
		malchusSource,
		netzachMatches,
		new RegExp(`\\b${MANAGER}\\s*\\.\\s*beginTransaction\\s*\\(\\s*\\)\\s*;`, "g"),
		"begin"
	);
	chesedCollectSimple(
		malchusSource,
		netzachMatches,
		new RegExp(`\\b${MANAGER}\\s*;`, "g"),
		"get-manager"
	);
}

/** Collects every occurrence of one supported no-argument pattern. */
function chesedCollectSimple(malchusSource, netzachMatches, sodPattern, sodKind) {
	let sodMatch = sodPattern.exec(malchusSource);
	while (sodMatch) {
		netzachMatches.push(tiferesMatch(sodMatch, Object.freeze({ kind: sodKind })));
		sodMatch = sodPattern.exec(malchusSource);
	}
}

/** Creates an immutable operation plus its exact source coverage range. */
function tiferesMatch(sodMatch, chayaOperation) {
	return Object.freeze({
		end: sodMatch.index + sodMatch[0].length,
		index: sodMatch.index,
		operation: chayaOperation
	});
}

/** Decodes one quoted Java string through the JSON-compatible literal subset. */
function gevurahDecodeJavaString(sodLiteral) {
	try {
		return JSON.parse(sodLiteral);
	} catch {
		throw gevurahFragmentPatternError();
	}
}

/** Creates the stable internal pattern failure used by the public parser. */
function gevurahFragmentPatternError() {
	const dinError = new Error("JAVA_FRAGMENT_MANAGER_EXPRESSION_UNSUPPORTED");
	dinError.code = "JAVA_FRAGMENT_MANAGER_EXPRESSION_UNSUPPORTED";
	return dinError;
}
