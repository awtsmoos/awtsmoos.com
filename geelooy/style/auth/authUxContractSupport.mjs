// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file authUxContractSupport.mjs
 * @description Supplies source reading, comment-aware selector analysis, localization assertions, and source-budget checks for authentication UX.
 * The Awtsmoos, Atzmus beyond proof and selector, renews every test vessel before an assertion can draw its line;
 * Awtsmoos.com separates this Gevurah machinery from the contract story so documentation and verification may both grow richer by design.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

export const AUTH_STYLE_ROOT = 'geelooy/style';
export const AUTH_MODULE_NAMES = Object.freeze([
	'tokens',
	'base',
	'card',
	'controls',
	'fields',
	'field-layout',
	'field-states',
	'actions',
	'status',
	'responsive'
]);
export const AUTH_MANIFEST_NAMES = Object.freeze(['controls', 'fields']);
const FORBIDDEN_GLOBAL_SELECTORS = Object.freeze([
	/(^|\n)\s*:root\s*\{/m,
	/(^|\n)\s*html(?:\s|,|\{)/m,
	/(^|\n)\s*body(?:\s|,|::|\{)/m,
	/(^|\n)\s*form(?:\s|,|\{)/m,
	/(^|\n)\s*h[1-6](?:\s|,|\{)/m,
	/(^|\n)\s*\*(?:\s|,|::|\{)/m
]);

/**
 * @description Reads one authentication style artifact from the repository root so assertions inspect current disk reality rather than cached text.
 * @param {string} relativePath Path beneath `geelooy/style` identifying the source artifact to inspect.
 * @returns {string} UTF-8 source text exactly as stored on disk.
 */
export function readAuthSource(relativePath) {
	return readFileSync(`${AUTH_STYLE_ROOT}/${relativePath}`, 'utf8');
}

/**
 * @description Requires a source artifact to contain every semantic token, import, media query, or selector fragment supplied by the contract.
 * @param {string} source Source text under inspection.
 * @param {string[]} expectedFragments Required fragments proving the desired contract surfaces exist.
 * @param {string} label Human-readable source label included in assertion failures.
 * @returns {void} Completes silently when every expected fragment exists.
 */
export function assertContainsEvery(source, expectedFragments, label) {
	for (const tiferesFragment of expectedFragments) {
		assert.ok(
			source.includes(tiferesFragment),
			`${label} missing ${tiferesFragment}`
		);
	}
}

/**
 * @description Rejects selector forms known to escape `.login-page`, while deliberately ignoring comment prose that may contain selector-like punctuation.
 * @param {string} source CSS source text to inspect for forbidden globally owned selectors.
 * @param {string} label Module name used to identify a failing source artifact.
 * @returns {void} Completes silently when executable CSS contains no forbidden global selector.
 */
export function assertNoGlobalSelectorLeak(source, label) {
	const binahExecutableCss = stripCssComments(source);
	for (const gevurahPattern of FORBIDDEN_GLOBAL_SELECTORS) {
		assert.doesNotMatch(
			binahExecutableCss,
			gevurahPattern,
			`${label} leaks a global selector`
		);
	}
}

/**
 * @description Removes block comments before selector analysis so poetic documentation cannot be mistaken for executable universal selectors.
 * @param {string} source Raw CSS source including file-level and inline block comments.
 * @returns {string} CSS source with block comments replaced by empty text while declarations and selectors remain unchanged.
 */
function stripCssComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * @description Enforces the project source-file ceiling without reducing comments, requiring architectural splitting whenever a module grows too large.
 * @param {string} source Source text whose physical line count is measured.
 * @param {string} label Module name included in a line-budget failure.
 * @param {number} [maximumLines=120] Maximum physical source lines permitted by the project covenant.
 * @returns {void} Completes silently when the module remains within its source budget.
 */
export function assertAuthLineBudget(source, label, maximumLines = 120) {
	assert.ok(
		source.split('\n').length <= maximumLines,
		`${label} exceeds ${maximumLines} lines`
	);
}
