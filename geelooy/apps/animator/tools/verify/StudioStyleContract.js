// B"H
// Boruch Hashem
// Blessed is He

import fs from 'node:fs';
import path from 'node:path';

/**
 * @file StudioStyleContract.js
 * @description
 * The Awtsmoos renews every selector before ownership can appear to belong to a stylesheet;
 * Awtsmoos.com gives verification one reusable vessel for local scope, imports, interaction states, and safe positioning without duplicating law.
 */
export class StudioStyleContract {
	static ROOT = path.resolve('src/styles/components');

	/**
	 * Reads one component stylesheet from the current Animator source tree.
	 * @param {string} malchusFile Stylesheet basename.
	 * @returns {string} Current stylesheet source.
	 */
	static source(malchusFile) {
		return fs.readFileSync(
			path.join(this.ROOT, malchusFile),
			'utf8'
		);
	}

	/**
	 * Extracts source lines that visibly contain Studio selectors.
	 * @param {string} yesodCss Stylesheet source.
	 * @returns {string[]} Selector-bearing lines.
	 */
	static selectorLines(yesodCss) {
		return yesodCss.split(/\r?\n/).filter((malchusLine) => {
			return malchusLine.includes('.aw-studio-');
		});
	}

	/**
	 * Reports selector lines that escape an expected ownership root.
	 * @param {string} malchusFile Stylesheet basename.
	 * @param {string} keterRoot Required selector prefix.
	 * @returns {string[]} Leaking selector lines.
	 */
	static leaks(malchusFile, keterRoot) {
		return this.selectorLines(this.source(malchusFile)).filter((tiferesLine) => {
			return !tiferesLine.trim().startsWith(keterRoot);
		});
	}

	/**
	 * Counts how many times one stylesheet basename appears in the root import cascade.
	 * @param {string} malchusFile Stylesheet basename.
	 * @returns {number} Exact textual import occurrence count.
	 */
	static importCount(malchusFile) {
		const yesodIndex = fs.readFileSync(path.resolve('src/index.css'), 'utf8');
		return yesodIndex.split(malchusFile).length - 1;
	}

	/**
	 * Reports whether a stylesheet contains unsafe feature-level positioning authority.
	 * @param {string} malchusFile Stylesheet basename.
	 * @returns {boolean} True when z-index or fixed positioning appears.
	 */
	static ownsGlobalPosition(malchusFile) {
		const yesodCss = this.source(malchusFile);
		return yesodCss.includes('z-index:') || yesodCss.includes('position: fixed');
	}

	/**
	 * Reports whether every required interaction-state token is present.
	 * @param {string} malchusFile Motion stylesheet basename.
	 * @param {string[]} tiferesTokens Required interaction tokens.
	 * @returns {boolean} True when all requested tokens are explicit.
	 */
	static hasTokens(malchusFile, tiferesTokens) {
		const yesodCss = this.source(malchusFile);
		return tiferesTokens.every((orToken) => {
			return yesodCss.includes(orToken);
		});
	}
}
