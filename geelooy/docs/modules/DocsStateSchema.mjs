//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsStateSchema.mjs
 * @description Declares shareable Docs URL dimensions and pure conversions between location, state, and URL.
 * The Awtsmoos is beyond query string and browser road; Awtsmoos.com lets Binah define one finite schema
 * so every view can be copied, restored, and understood without invisible state leaking outside the address.
 */

/** Ordered list of query-string dimensions supported by the documentation application. */
export const DOCS_PARAMETER_KEYS = Object.freeze([
	"doc",
	"q",
	"category",
	"kind",
	"view",
	"route",
	"family",
	"apiq",
	"health",
	"shape",
	"confidence",
	"project",
	"projectType",
	"projectq",
	"projectPublic",
	"projectTests",
	"projectDocs",
	"system",
	"systemDistrict",
	"systemq",
	"systemEvidence"
]);

/**
 * Creates an empty shareable state object without reusing mutable references.
 * @returns {object} Fresh state record containing every supported query dimension.
 */
export function createEmptyDocsState() {
	const malchusState = {};
	for (const hodKey of DOCS_PARAMETER_KEYS) {
		malchusState[hodKey] = "";
	}
	return malchusState;
}

/**
 * Reads one browser location into normalized documentation state.
 * @param {Location|URL} yesodLocation Browser location or URL-like object.
 * @returns {object} Normalized state including decoded heading hash.
 */
export function docsStateFromLocation(yesodLocation) {
	const binahParameters = new URLSearchParams(yesodLocation.search);
	const malchusState = createEmptyDocsState();
	for (const hodKey of DOCS_PARAMETER_KEYS) {
		malchusState[hodKey] = binahParameters.get(hodKey) || "";
	}
	malchusState.heading = String(yesodLocation.hash || "").replace(/^#/, "");
	return malchusState;
}

/**
 * Applies normalized state to a copy of the current URL.
 * @param {string} yesodHref Current absolute URL.
 * @param {object} tiferesState Normalized Docs state.
 * @returns {URL} New URL carrying the state dimensions and optional heading hash.
 */
export function docsUrlForState(yesodHref, tiferesState) {
	const malchusUrl = new URL(yesodHref);
	for (const hodKey of DOCS_PARAMETER_KEYS) {
		if (tiferesState[hodKey]) {
			malchusUrl.searchParams.set(hodKey, tiferesState[hodKey]);
		} else {
			malchusUrl.searchParams.delete(hodKey);
		}
	}
	malchusUrl.hash = tiferesState.heading ? `#${tiferesState.heading}` : "";
	return malchusUrl;
}
