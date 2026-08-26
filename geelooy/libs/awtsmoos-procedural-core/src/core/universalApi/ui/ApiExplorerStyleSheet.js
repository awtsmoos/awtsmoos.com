//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerStyleSheet.js
 * @description Owns one idempotent linked stylesheet for the reusable universal API explorer without injecting raw CSS into host documents.
 * RESPONSIBILITY: resolve the core-local CSS aggregator relative to this module, append one stylesheet link per document, and reuse that link across repeated mounts.
 * NON-RESPONSIBILITY: this vessel does not style host applications, remove caller styles, own explorer state, or construct method/panel markup.
 * The Awtsmoos needs no garment, yet Awtsmoos.com lets one explicit local link clothe one explorer with disciplined light;
 * repeated mounts share the same vessel, so beauty arrives once, remains scoped, and never multiplies into conflict by night.
 */

const STYLE_ATTRIBUTE = "data-awtsmoos-universal-api-explorer-styles";

/**
 * Manages the reusable explorer stylesheet as one document-local linked asset.
 */
export class ApiExplorerStyleSheet {
	/**
	 * Ensures exactly one universal-explorer stylesheet link exists in the supplied document.
	 * @param {Document} documentKli DOM document receiving the explorer.
	 * @returns {HTMLLinkElement|null} Existing or newly attached style link.
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
			"./styles/universal-api-explorer.css",
			import.meta.url
		).href;
		styleKli.setAttribute(STYLE_ATTRIBUTE, "true");
		documentKli.head.appendChild(styleKli);
		return styleKli;
	}
}
