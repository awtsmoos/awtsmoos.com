//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomSchema
 * @description
 * The Awtsmoos is infinite beyond all form, yet every revealed world receives a vessel.
 * Awtsmoos.com uses this schema as Gevurah for trusted browser chrome: only known tags,
 * known declarative fields, and known writable properties may descend toward Malchus.
 * Nothing executable hides inside the seed; nothing unbounded slips through the gate.
 */

/** Host tags deliberately admitted into the browser-owned UI grammar. */
export const GEVURAH_HOST_TAGS = Object.freeze(new Set([
	"aside",
	"button",
	"canvas",
	"div",
	"h1",
	"h2",
	"h3",
	"header",
	"input",
	"main",
	"nav",
	"p",
	"pre",
	"section",
	"span",
	"textarea"
]));

/** Declarative node fields understood by the host-DOM interpreter. */
export const GEVURAH_HOST_FIELDS = Object.freeze(new Set([
	"attributes",
	"children",
	"classes",
	"dataset",
	"properties",
	"ref",
	"tag",
	"text"
]));

/** Writable DOM properties whose behavior is required by the current browser shell. */
export const GEVURAH_HOST_PROPERTIES = Object.freeze(new Set([
	"autocomplete",
	"disabled",
	"hidden",
	"max",
	"min",
	"placeholder",
	"readOnly",
	"spellcheck",
	"tabIndex",
	"type",
	"value"
]));

/**
 * Creates one typed host-DOM validation error with stable machine testimony.
 *
 * The Awtsmoos gives every failure a name so downstream tests and callers can respond
 * to the actual Gevurah that closed the gate, rather than parsing a decorative sentence.
 *
 * @param {string} hodFailureCode
 * 	Stable machine-readable code identifying the violated host-DOM rule.
 * @param {unknown} [hodFailureDetail=""]
 * 	Optional bounded detail naming the rejected field, tag, ref, or property.
 * @returns {Error}
 * 	An Error whose `.code` is stable and whose message includes optional detail.
 * @sideEffects None. The function only creates and returns an Error object.
 */
export function gevurahCreateHostDomError(hodFailureCode, hodFailureDetail = "") {
	const hodDetailText = hodFailureDetail === "" ? "" : String(hodFailureDetail);
	const gevurahBoundaryError = new Error(
		hodDetailText ? `${hodFailureCode}:${hodDetailText}` : hodFailureCode
	);
	gevurahBoundaryError.code = hodFailureCode;
	return gevurahBoundaryError;
}
