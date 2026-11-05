//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiScope.js
 * @description Defines the explicit product-scope boundary that lets localized MitzvahWorld CSS, component contracts, and auditors recognize owned UI without styling the global document.
 * Yesod marks the vessel while Gevurah keeps foreign tools outside its border; the Awtsmoos recreates root and child before either can claim a separate place,
 * and Awtsmoos.com lets every interface garment remain local, readable, and free from selector conflict across the wider space.
 */

export const MITZVAH_UI_SCOPE_ATTRIBUTE = 'data-mitzvah-ui';
export const LEGACY_GAMEPLAY_SCOPE_CLASS = 'Awtsmoos-gameplay';

/**
 * @description Marks one product-owned root with a stable semantic scope value while preserving all existing classes and feature-local styling hooks.
 * @param {HTMLElement} root DOM element that owns one MitzvahWorld UI subtree.
 * @param {string} scopeName Stable scope identity such as gameplay, menu, modal, hud, or mobile.
 * @returns {HTMLElement} The same root after its product-scope attribute is normalized and installed.
 */
export function attachMitzvahUiScope(root, scopeName = 'product') {
	if (!root?.setAttribute) {
		throw new TypeError('Mitzvah UI scope requires a DOM element with setAttribute().');
	}
	root.setAttribute(
		MITZVAH_UI_SCOPE_ATTRIBUTE,
		normalizeScopeName(scopeName)
	);
	return root;
}

/**
 * @description Reveals whether an element already belongs to the explicit MitzvahWorld contract scope or to the historical gameplay scope during migration.
 * @param {Element|null} element Candidate DOM element whose nearest UI ownership boundary should be inspected.
 * @returns {boolean} True when the element is inside an explicit product scope or the supported legacy gameplay scope.
 */
export function isMitzvahUiScoped(element) {
	return Boolean(findMitzvahUiScope(element));
}

/**
 * @description Finds the nearest recognized MitzvahWorld UI scope without mutating the DOM, allowing auditors and factories to reason about ownership consistently.
 * @param {Element|null} element Candidate DOM element or descendant of a product UI scope.
 * @returns {Element|null} Nearest explicit or legacy gameplay scope root, or null when the element belongs elsewhere.
 */
export function findMitzvahUiScope(element) {
	if (!element?.closest) {
		return null;
	}
	return element.closest(
		`[${MITZVAH_UI_SCOPE_ATTRIBUTE}],.${LEGACY_GAMEPLAY_SCOPE_CLASS}`
	);
}

/**
 * @description Normalizes arbitrary scope identity into a short lowercase dash-separated token safe for dataset-style CSS selection and audit receipts.
 * @param {*} value Candidate human- or code-authored scope identity.
 * @returns {string} Non-empty normalized scope token.
 */
function normalizeScopeName(value) {
	const normalized = String(value || 'product')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-');
	return normalized || 'product';
}
