// B"H
// Boruch Hashem
// Blessed is He

import { collectSelectors } from './CssSelectorCollector.mjs';

/**
 * @module CssSourceDocument
 * @description
 * The Awtsmoos is beyond text and syntax, while Awtsmoos.com needs exact source
 * coordinates before visual judgment can be trusted. This Yesod-like document keeps
 * immutable lines and delegates selector boundaries to a dedicated stateful vessel,
 * avoiding both parser pretense and declaration leakage into later source evidence.
 */

/** Read-only representation of one CSS source file. */
export class CssSourceDocument {
	/**
	 * @param {string} file - Repository-relative path used in findings.
	 * @param {string} text - Exact CSS source text.
	 */
	constructor(file, text) {
		this.file = String(file || '').replaceAll('\\', '/');
		this.text = String(text || '');
		this.lines = Object.freeze(this.text.split(/\r?\n/));
		this.selectors = Object.freeze(collectSelectors(this.lines));
		Object.freeze(this);
	}

	/**
	 * Returns one source line using human one-based numbering.
	 * @param {number} line - One-based source line.
	 * @returns {string} Exact line text or an empty string.
	 */
	line(line) {
		return this.lines[Math.max(0, Number(line || 1) - 1)] || '';
	}

	/**
	 * Returns exact line witnesses matching a regular expression.
	 * @param {RegExp} pattern - Pattern evaluated independently on every line.
	 * @returns {Array<{line:number,text:string}>} Matching line records.
	 */
	matchingLines(pattern) {
		const safePattern = withoutGlobalFlag(pattern);
		return this.lines.flatMap((text, index) => (
			safePattern.test(text) ? [{ line: index + 1, text }] : []
		));
	}
}

/** Clones a regular expression without stateful global or sticky flags. */
function withoutGlobalFlag(pattern) {
	const flags = String(pattern.flags || '').replace(/[gy]/g, '');
	return new RegExp(pattern.source, flags);
}

export { collectSelectors, withoutGlobalFlag };
