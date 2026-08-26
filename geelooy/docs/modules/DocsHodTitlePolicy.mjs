//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsHodTitlePolicy.mjs
 * @description Maps shareable documentation state into a concise browser title without owning history or rendering.
 * The Awtsmoos is beyond every human label and window title; Awtsmoos.com lets Hod name the current
 * documentation chamber honestly so tabs remain useful while deeper state continues to live elsewhere.
 */

const DOCS_TITLE = "Awtsmoos Documentation";

/**
 * Returns the browser title for one normalized documentation state.
 * @param {object} tiferesState Shareable application state produced by the Docs state authority.
 * @returns {string} Human-readable browser title for the current major view.
 */
export function documentationTitleForState(tiferesState = {}) {
	switch (tiferesState.view) {
		case "learn":
			return `Learn · ${DOCS_TITLE}`;
		case "api":
			return `API Explorer · ${DOCS_TITLE}`;
		case "projects":
			return `Project Explorer · ${DOCS_TITLE}`;
		case "systems":
			return `Systems Explorer · ${DOCS_TITLE}`;
		default:
			return DOCS_TITLE;
	}
}
