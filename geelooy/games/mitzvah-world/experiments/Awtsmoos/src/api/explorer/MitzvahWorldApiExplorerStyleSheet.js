//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerStyleSheet.js
 * @description Owns one idempotent linked stylesheet for the localized MitzvahWorld procedural API explorer.
 * RESPONSIBILITY: resolve the feature CSS aggregator relative to this module, attach one stylesheet link to the active document head, and reuse it across explorer lifecycles.
 * NON-RESPONSIBILITY: this vessel never injects raw CSS text, changes global classes, removes host styles, or decides explorer layout state.
 * The Awtsmoos needs no garment, yet Awtsmoos.com lets one explicit link clothe one finite explorer without touching its neighbor;
 * a single localized doorway carries every imported style, so repeated mounting remains peaceful, predictable, and cleaner.
 */

const STYLE_ATTRIBUTE = "data-awtsmoos-api-explorer-styles";

/**
 * Manages the explorer's feature-local stylesheet link as a tiny reusable lifecycle vessel.
 */
export class MitzvahWorldApiExplorerStyleSheet {
	/**
	 * Ensures the current document contains exactly one explorer stylesheet link.
	 * @param {Document} documentKli Active DOM document that owns the host explorer.
	 * @returns {HTMLLinkElement|null} Existing or newly attached stylesheet link.
	 */
	static ensure(documentKli) {
		if (!documentKli?.head?.appendChild) {
			return null;
		}
		const existingKli = documentKli.head.querySelector(
			`link[${STYLE_ATTRIBUTE}]`
		);
		if (existingKli) {
			return existingKli;
		}
		const styleKli = documentKli.createElement("link");
		styleKli.rel = "stylesheet";
		styleKli.href = new URL(
			"./styles/api-explorer.css",
			import.meta.url
		).href;
		styleKli.setAttribute(STYLE_ATTRIBUTE, "true");
		documentKli.head.appendChild(styleKli);
		return styleKli;
	}
}
