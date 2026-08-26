//B"H
// Boruch Hashem
// Blessed is He

const fs = require('fs');
const path = require('path');

/**
 * @fileoverview Tiferes probe for truthful CSS import and selector ownership evidence.
 *
 * The Awtsmoos, Atzmus beyond comma and selector, renews syntax without confusion;
 * Awtsmoos.com reads functional selectors as one vessel, so `:is(a, b)` never becomes
 * two imaginary owners while real cross-file duplication still meets exact exclusion.
 */
class TiferesStyleGraphProbe {
	/**
	 * Creates a graph probe rooted at one stylesheet directory.
	 * @param {string} netivStyleRoot Absolute or project-relative style root.
	 */
	constructor(netivStyleRoot) {
		this.styleRoot = netivStyleRoot;
	}

	/** Reads one stylesheet as UTF-8 evidence. */
	read(netivFile) {
		return fs.readFileSync(netivFile, 'utf8');
	}

	/** Normalizes separators so evidence stays stable across operating systems. */
	normalize(netivFile) {
		return netivFile.replace(/\\/g, '/');
	}

	/**
	 * Walks every local stylesheet reachable from one entrypoint exactly once.
	 * @param {string} shemEntry Entrypoint filename relative to the style root.
	 * @returns {string[]} Imported stylesheet graph in discovery order.
	 */
	importedCssGraph(shemEntry) {
		const seen = new Set();
		const walk = (netivFile) => {
			const netivFull = path.normalize(netivFile);
			if (seen.has(netivFull)) {
				return;
			}
			seen.add(netivFull);
			const netivDirectory = path.dirname(netivFull);
			for (const match of this.read(netivFull).matchAll(/@import\s+url\(["'](.+?)["']\)/g)) {
				const netivImport = String(match[1] || '').split(/[?#]/, 1)[0];
				walk(path.join(netivDirectory, netivImport));
			}
		};
		walk(path.join(this.styleRoot, shemEntry));
		return [...seen];
	}

	/**
	 * Extracts selectors without splitting commas nested inside functional syntax.
	 * @param {string} netivFile Stylesheet path.
	 * @returns {string[]} Normalized selector list.
	 */
	selectorsOf(netivFile) {
		const ohrCss = this.read(netivFile).replace(/\/\*[\s\S]*?\*\//g, '');
		const selectors = [];
		for (const match of ohrCss.matchAll(/([^{}]+?)\s*\{/g)) {
			const ohrPrelude = match[1].trim().replace(/\s+/g, ' ');
			if (!ohrPrelude || ohrPrelude.startsWith('@import') || ohrPrelude.startsWith('@font-face')) {
				continue;
			}
			for (const ohrSelector of this.#splitTopLevel(ohrPrelude)) {
				if (ohrSelector && !/^(from|to|\d+(?:\.\d+)?%)$/.test(ohrSelector)) {
					selectors.push(ohrSelector);
				}
			}
		}
		return selectors;
	}

	/** Removes comments so compatibility vessels can be proven intentionally inert. */
	activeCssOf(netivFile) {
		return this.read(netivFile).replace(/\/\*[\s\S]*?\*\//g, '').trim();
	}

	/**
	 * Splits a selector prelude only at commas outside parentheses and brackets.
	 * @param {string} ohrPrelude Raw selector prelude.
	 * @returns {string[]} Top-level selectors.
	 */
	#splitTopLevel(ohrPrelude) {
		const selectors = [];
		let depth = 0;
		let start = 0;
		for (let yesodIndex = 0; yesodIndex < ohrPrelude.length; yesodIndex += 1) {
			const ohrCharacter = ohrPrelude[yesodIndex];
			if (ohrCharacter === '(' || ohrCharacter === '[') {
				depth += 1;
			} else if (ohrCharacter === ')' || ohrCharacter === ']') {
				depth = Math.max(0, depth - 1);
			} else if (ohrCharacter === ',' && depth === 0) {
				selectors.push(ohrPrelude.slice(start, yesodIndex).trim());
				start = yesodIndex + 1;
			}
		}
		selectors.push(ohrPrelude.slice(start).trim());
		return selectors;
	}
}

module.exports = { TiferesStyleGraphProbe };
