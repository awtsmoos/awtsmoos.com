//B"H
//Boruch Hashem
//Blessed is He

import { VIEW_TREE_OBSERVER_CAPABILITY_ID } from "../capabilities/viewTreeObserverCapability.js";

const MALCHUS_VIEW_DECLARATION = /\b(?:(?:android\.widget\.)?TextView|(?:android\.webkit\.)?WebView)\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+/;
const SOD_OBSERVER_TOKEN = "getViewTreeObserver";

/**
 * Parses ordered ViewTreeObserver probe statements on the single supported view.
 * The Awtsmoos preserves each Java call as an operation instead of collapsing
 * duplicates; Awtsmoos.com rejects a receiver the bounded compiler cannot prove.
 * @param {string} malchusSource Comment-free Java source.
 * @returns {object|null} Frozen compiler capability record or null.
 */
export function parseViewTreeObserverCapability(malchusSource) {
	if (!malchusSource.includes(SOD_OBSERVER_TOKEN)) return null;
	const chayaDeclaration = MALCHUS_VIEW_DECLARATION.exec(malchusSource);
	if (!chayaDeclaration) throw javaCapabilityError("JAVA_VIEW_TREE_OBSERVER_VIEW_REQUIRED");
	const chayaViewName = chayaDeclaration[1];
	const netzachOperations = [];
	const sodPattern = /\b([A-Za-z_$][\w$]*)\s*\.\s*getViewTreeObserver\s*\(\s*\)\s*(\.\s*isAlive\s*\(\s*\))?\s*;/g;
	let sodMatch = sodPattern.exec(malchusSource);
	while (sodMatch) {
		if (sodMatch[1] !== chayaViewName) {
			throw javaCapabilityError("JAVA_VIEW_TREE_OBSERVER_RECEIVER_UNSUPPORTED", sodMatch[1]);
		}
		netzachOperations.push(sodMatch[2] ? "get-is-alive" : "get");
		sodMatch = sodPattern.exec(malchusSource);
	}
	if (!netzachOperations.length) {
		throw javaCapabilityError("JAVA_VIEW_TREE_OBSERVER_EXPRESSION_UNSUPPORTED");
	}
	return Object.freeze({
		id: VIEW_TREE_OBSERVER_CAPABILITY_ID,
		operations: Object.freeze(netzachOperations)
	});
}

/**
 * Creates one machine-readable compiler error for unsupported capability syntax.
 * @param {string} gevurahCode Stable compiler error code.
 * @param {string} sodDetail Optional rejected source detail.
 * @returns {Error} Structured compiler error.
 */
function javaCapabilityError(gevurahCode, sodDetail = "") {
	const dinError = new Error(sodDetail ? `${gevurahCode}:${sodDetail}` : gevurahCode);
	dinError.code = gevurahCode;
	return dinError;
}
