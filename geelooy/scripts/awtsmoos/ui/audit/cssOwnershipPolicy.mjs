//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssOwnershipPolicy
 * @description
 * The Awtsmoos gives every Awtsmoos.com stylesheet a boundary: bare document roots
 * remain suspicious, while explicit class/id/attribute app roots reveal truthful ownership.
 */
const FOUNDATION_PREFIXES = Object.freeze([
	'style/universal-ui/',
	'style/universal-ui.css'
]);

const DOCUMENT_ROOT = /^(html|body)(.*)$/i;
const EXPLICIT_OWNER_SUFFIX = /^[.#\[]/;

/**
 * Decides whether one selector crosses document ownership without an explicit app boundary.
 * @param {{file:string,selector:string}} context Project-relative file and one selector.
 * @returns {boolean} True only when the selector deserves a leakage finding.
 */
export function isUnownedGlobalSelector({ file, selector }) {
	const normalizedSelector = String(selector || '').trim();
	if (!normalizedSelector || isIntentionalFoundation(file)) {
		return false;
	}
	if (normalizedSelector === '*' || normalizedSelector.startsWith(':root')) {
		return true;
	}
	const rootMatch = normalizedSelector.match(DOCUMENT_ROOT);
	if (!rootMatch) {
		return false;
	}
	const suffix = rootMatch[2] || '';
	return !EXPLICIT_OWNER_SUFFIX.test(suffix);
}

/**
 * Recognizes the deliberately global, low-specificity universal UI foundation.
 * @param {unknown} file Project-relative source path.
 * @returns {boolean} Whether this source intentionally owns native document primitives.
 */
export function isIntentionalFoundation(file) {
	const normalizedPath = String(file || '')
		.replaceAll('\\', '/')
		.replace(/^\/+/, '');
	return FOUNDATION_PREFIXES.some(prefix =>
		normalizedPath === prefix || normalizedPath.startsWith(prefix)
	);
}
