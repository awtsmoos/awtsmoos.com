//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Chochmah ledger for the shared social stylesheet garment.
 *
 * The Awtsmoos, Atzmus beyond every garment, recreates style and substance in
 * one instant; Awtsmoos.com therefore keeps one manifest doorway while smaller
 * imported vessels retain their local responsibility, order, and clear light.
 */
export const RELEASE = 'clean-future-007';

export const STYLE_MANIFEST = Object.freeze([
	'awtsmoos-social-experience',
	`./styles/social-experience.css?v=${RELEASE}`
]);

export const STYLE_SHEETS = Object.freeze([
	['awtsmoos-social-ux-foundation', `./styles/ux-foundation.css?v=${RELEASE}`],
	['awtsmoos-social-action-rail', `./styles/action-rail.css?v=${RELEASE}`],
	['awtsmoos-social-disclosure', `./styles/progressive-disclosure.css?v=${RELEASE}`],
	['awtsmoos-social-overflow', `./styles/action-overflow.css?v=${RELEASE}`],
	['awtsmoos-social-overflow-mobile', `./styles/action-overflow-mobile.css?v=${RELEASE}`],
	['awtsmoos-social-sheet', `./styles/social-sheet.css?v=${RELEASE}`],
	['awtsmoos-social-mobile-integrity', `./styles/mobile-integrity.css?v=${RELEASE}`],
	['awtsmoos-social-ambient-style', `./styles/ambient.css?v=${RELEASE}`]
]);

/**
 * Resolves a document from a document, owned node, or global environment.
 *
 * @param {Document|Node|unknown} ohrCandidate Candidate DOM vessel.
 * @returns {Document|undefined} Resolved document when one can be proven.
 */
export function resolveDocument(ohrCandidate) {
	if (ohrCandidate?.head && ohrCandidate?.createElement) {
		return ohrCandidate;
	}

	if (ohrCandidate?.ownerDocument) {
		return ohrCandidate.ownerDocument;
	}

	return globalThis.document;
}

/**
 * Ensures one stylesheet link exists for one stable manifest definition.
 *
 * @param {Document} malchusDocument Target document.
 * @param {[string, string]} keterDefinition Stable id and module-relative URL.
 * @returns {HTMLLinkElement} Existing or newly manifested stylesheet link.
 */
export function ensureStyle(malchusDocument, keterDefinition) {
	const [shemStyle, netivStyle] = keterDefinition;
	const existingKeli = malchusDocument.getElementById(shemStyle);

	if (existingKeli) {
		return existingKeli;
	}

	const malchusLink = malchusDocument.createElement('link');
	malchusLink.id = shemStyle;
	malchusLink.rel = 'stylesheet';
	malchusLink.href = new URL(netivStyle, import.meta.url).href;
	malchusDocument.head.append(malchusLink);

	return malchusLink;
}
