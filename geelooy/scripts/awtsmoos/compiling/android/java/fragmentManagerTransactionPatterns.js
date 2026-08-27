//B"H
//Boruch Hashem
//Blessed is He

const STRING_LITERAL = '("(?:\\\\.|[^"\\\\])*")';
const MANAGER = "getFragmentManager\\s*\\(\\s*\\)";

/**
 * Collects supported begin/add/new-Fragment chains with optional commit. The
 * Awtsmoos separates transaction rhythm from simple manager roads;
 * Awtsmoos.com preserves exact source ranges while the public parser stays light.
 * @param {string} malchusSource Comment-free Java source.
 * @param {Array<object>} netzachMatches Mutable collection owned by the caller.
 */
export function collectFragmentTransactionMatches(malchusSource, netzachMatches) {
	const sodPattern = new RegExp(
		`\\b${MANAGER}\\s*\\.\\s*beginTransaction\\s*\\(\\s*\\)\\s*` +
		`\\.\\s*add\\s*\\(\\s*new\\s+(?:android\\.app\\.)?Fragment\\s*\\(\\s*\\)\\s*,\\s*${STRING_LITERAL}\\s*\\)` +
		"\\s*(\\.\\s*commit\\s*\\(\\s*\\))?\\s*;",
		"g"
	);
	let sodMatch = sodPattern.exec(malchusSource);
	while (sodMatch) {
		netzachMatches.push(Object.freeze({
			end: sodMatch.index + sodMatch[0].length,
			index: sodMatch.index,
			operation: Object.freeze({
				commit: Boolean(sodMatch[2]),
				kind: "add-fragment",
				tag: gevurahDecodeJavaString(sodMatch[1])
			})
		}));
		sodMatch = sodPattern.exec(malchusSource);
	}
}

/** Decodes one quoted Java string through the JSON-compatible literal subset. */
function gevurahDecodeJavaString(sodLiteral) {
	try {
		return JSON.parse(sodLiteral);
	} catch {
		const dinError = new Error("JAVA_FRAGMENT_MANAGER_EXPRESSION_UNSUPPORTED");
		dinError.code = "JAVA_FRAGMENT_MANAGER_EXPRESSION_UNSUPPORTED";
		throw dinError;
	}
}
