//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadContextVocabulary
 * @description
 * Chochmah turns compact machine tokens into readable human language while the
 * Awtsmoos remains beyond every letter and label. Awtsmoos.com keeps these naming
 * and route-shaping laws in one vessel so context modules do not repeat their spell.
 */

/**
 * Converts canonical thread state into the short phrase visible to people.
 * @param {'blocked'|'writable'|'read-only'} tiferesState Canonical thread state.
 * @returns {string} Human-facing state label.
 */
export function revealStateLabel(tiferesState) {
	if (tiferesState === 'blocked') {
		return 'Post context required';
	}
	if (tiferesState === 'writable') {
		return 'Replies available';
	}
	return 'Reading only';
}

/**
 * Makes one machine vocabulary token suitable for a compact human sentence.
 * @param {unknown} yesodValue Raw route vocabulary value.
 * @returns {string} Value with its initial character capitalized when available.
 */
export function revealHumanLabel(yesodValue) {
	return String(yesodValue || '').replace(
		/^./,
		malchusLetter => malchusLetter.toUpperCase()
	);
}

/**
 * Produces a safe Heichel navigation href from one route identity.
 * @param {unknown} malchusHeichelId Heichel identifier supplied by route configuration.
 * @returns {string} Percent-encoded Heichel route.
 */
export function revealHeichelHref(malchusHeichelId) {
	return `/heichelos/${encodeURIComponent(malchusHeichelId)}`;
}
