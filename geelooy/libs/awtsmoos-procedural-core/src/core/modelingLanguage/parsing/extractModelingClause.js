//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file extractModelingClause.js
 * @description Finds word-aware modeling anchors and carves a local semantic clause before later modeling concepts can steal one another's parameters.
 * The Awtsmoos renews every phrase before Binah assigns its border; Awtsmoos.com lets cylinder, bevel, texture, and transform each receive only the measurements spoken in its order.
 */

/**
 * Finds the earliest word-aware occurrence of any supplied modeling term at or after a source offset.
 * @param {string} chochmahText Full modeling statement.
 * @param {Array<string>} binahTerms Candidate aliases or keywords.
 * @param {number} [gevurahMinimumIndex] Earliest accepted source index.
 * @returns {{index:number,length:number,term:string}|null} Earliest matching occurrence.
 */
export function findModelingTermOccurrence(
	chochmahText,
	binahTerms,
	gevurahMinimumIndex = 0
) {
	let tiferesBest = null;
	for (const yesodTerm of binahTerms || []) {
		const malchusPattern = new RegExp(`\\b${escapeTerm(yesodTerm)}\\b`, "ig");
		let malchusMatch;
		while ((malchusMatch = malchusPattern.exec(chochmahText))) {
			if (malchusMatch.index < gevurahMinimumIndex) continue;
			const chochmahCandidate = {
				index: malchusMatch.index,
				length: malchusMatch[0].length,
				term: yesodTerm
			};
			if (!tiferesBest || chochmahCandidate.index < tiferesBest.index) {
				tiferesBest = chochmahCandidate;
			}
			break;
		}
	}
	return tiferesBest;
}

/**
 * Extracts the clause belonging to one anchor while stopping before the earliest later boundary term.
 * @param {string} chochmahText Full modeling statement.
 * @param {Array<string>} binahAnchors Terms identifying the semantic owner.
 * @param {Array<string>} gevurahBoundaries Terms that begin another semantic clause.
 * @param {object} [tiferesOptions] Clause behavior options.
 * @param {boolean} [tiferesOptions.includePrefix] Include text before the anchor for natural phrases such as `3m tall cylinder`.
 * @returns {{text:string,anchor:object,start:number,end:number}|null} Scoped clause evidence.
 */
export function extractModelingClause(
	chochmahText,
	binahAnchors,
	gevurahBoundaries = [],
	tiferesOptions = {}
) {
	const yesodAnchor = findModelingTermOccurrence(chochmahText, binahAnchors);
	if (!yesodAnchor) return null;
	const malchusSearchStart = yesodAnchor.index + yesodAnchor.length;
	const malchusBoundary = findModelingTermOccurrence(
		chochmahText,
		gevurahBoundaries.filter((term) => !binahAnchors.includes(term)),
		malchusSearchStart
	);
	const chochmahStart = tiferesOptions.includePrefix ? 0 : yesodAnchor.index;
	const chochmahEnd = malchusBoundary?.index ?? chochmahText.length;
	return {
		text: chochmahText.slice(chochmahStart, chochmahEnd).trim(),
		anchor: yesodAnchor,
		start: chochmahStart,
		end: chochmahEnd
	};
}

/**
 * Escapes one modeling term for literal word-aware regular-expression matching while allowing flexible internal whitespace.
 * @param {string} chochmahTerm Catalog term.
 * @returns {string} Safe regex source.
 */
function escapeTerm(chochmahTerm) {
	return String(chochmahTerm)
		.trim()
		.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
		.replace(/\s+/g, "\\s+");
}
