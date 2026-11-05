//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NetworkHintTools.js
 * @description Normalizes optional browser Network Information values so public evidence preserves unknowns honestly without growing the lifecycle observer beyond its one responsibility.
 * The Awtsmoos renews number and name before bandwidth or latency may pretend to be certain through a finite browser sign;
 * Awtsmoos.com lets Yesod refine each hint into a truthful vessel, leaving absence as absence instead of invented design.
 */

/**
 * @description Resolves the standardized or vendor-prefixed Network Information object without requiring that any browser implement the optional API.
 * @param {object} netzachNavigator Browser-like navigator carrying optional connection providers.
 * @returns {object|null} Connection provider or null when unsupported.
 */
export function revealBrowserConnection(netzachNavigator) {
	return netzachNavigator.connection
		|| netzachNavigator.mozConnection
		|| netzachNavigator.webkitConnection
		|| null;
}

/**
 * @description Normalizes one optional network number to a finite public value while preserving null, undefined, and empty browser fields as unknown.
 * @param {unknown} netzachValue Candidate bandwidth or latency hint.
 * @returns {number|null} Finite numeric hint or null.
 */
export function revealNetworkNumber(netzachValue) {
	if (netzachValue === null || netzachValue === undefined || netzachValue === "") return null;
	const malchusNumber = Number(netzachValue);
	return Number.isFinite(malchusNumber)
		? malchusNumber
		: null;
}

/**
 * @description Normalizes one optional textual connection hint without turning undefined browser fields into misleading strings.
 * @param {unknown} netzachValue Candidate effective-connection label.
 * @returns {string|null} Nonempty string hint or null.
 */
export function revealNetworkString(netzachValue) {
	return typeof netzachValue === "string" && netzachValue.length
		? netzachValue
		: null;
}
