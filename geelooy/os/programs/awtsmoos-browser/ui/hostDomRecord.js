//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomRecord
 * @description
 * The Awtsmoos gives boundaries to every vessel before any property descends into form.
 * Awtsmoos.com uses this Gevurah layer for host-owned key/value testimony: attributes,
 * dataset, and writable properties remain scalar, explicit, and free of executable keys.
 * The river may be generous in Chesed, but its banks are named before Malchus can flow.
 */

import {
	GEVURAH_HOST_PROPERTIES,
	gevurahCreateHostDomError
} from "./hostDomSchema.js";

/**
 * Requires a plain object wherever the declarative host grammar expects a record.
 *
 * @param {unknown} yesodRecordSeed
 * 	Candidate record supplied by a host UI declaration.
 * @param {string} hodFailureCode
 * 	Stable machine-readable code for invalid record shape.
 * @returns {void}
 * @throws {Error}
 * 	When the candidate is null, non-object, or an Array.
 * @sideEffects None. The function performs validation only.
 */
export function gevurahAssertPlainRecord(yesodRecordSeed, hodFailureCode) {
	if (!yesodRecordSeed || typeof yesodRecordSeed !== "object" || Array.isArray(yesodRecordSeed)) {
		throw gevurahCreateHostDomError(hodFailureCode);
	}
}

/**
 * Normalizes an attribute or dataset record into immutable scalar testimony.
 *
 * Keys resembling inline events, style authority, or HTML injection are forbidden even
 * though this grammar is host-only; defense belongs near the source, not after rendering.
 *
 * @param {Object|undefined|null} yesodRecordSeed
 * 	Candidate attribute, dataset, or other scalar declaration record.
 * @param {string} hodFailureCode
 * 	Stable code used when record shape or scalar values are invalid.
 * @returns {Object}
 * 	A frozen shallow record containing only string, number, or boolean values.
 * @throws {Error}
 * 	When a key or value violates the host-only grammar.
 * @sideEffects None.
 */
export function yesodNormalizeScalarRecord(yesodRecordSeed, hodFailureCode) {
	if (yesodRecordSeed == null) return Object.freeze({});
	gevurahAssertPlainRecord(yesodRecordSeed, hodFailureCode);
	const yesodScalarTestimony = {};
	for (const [hodScalarName, hodScalarValue] of Object.entries(yesodRecordSeed)) {
		if (gevurahScalarNameIsForbidden(hodScalarName)) {
			throw gevurahCreateHostDomError("HOST_DOM_SCALAR_KEY_FORBIDDEN", hodScalarName);
		}
		if (!["string", "number", "boolean"].includes(typeof hodScalarValue)) {
			throw gevurahCreateHostDomError(hodFailureCode, hodScalarName);
		}
		yesodScalarTestimony[hodScalarName] = hodScalarValue;
	}
	return Object.freeze(yesodScalarTestimony);
}

/**
 * Restricts writable DOM properties to the browser shell's explicit allowlist.
 *
 * @param {Object|undefined|null} yesodPropertySeed
 * 	Candidate property record declared by host UI data.
 * @returns {Object}
 * 	Frozen scalar property testimony safe for later renderer assignment.
 * @throws {Error}
 * 	When any property is outside the current shell contract or any value is non-scalar.
 * @sideEffects None. Actual DOM property assignment happens only in HostDomRender.
 */
export function gevurahNormalizePropertyRecord(yesodPropertySeed) {
	const yesodPropertyTestimony = yesodNormalizeScalarRecord(
		yesodPropertySeed,
		"HOST_DOM_PROPERTIES_INVALID"
	);
	for (const hodPropertyName of Object.keys(yesodPropertyTestimony)) {
		if (!GEVURAH_HOST_PROPERTIES.has(hodPropertyName)) {
			throw gevurahCreateHostDomError("HOST_DOM_PROPERTY_FORBIDDEN", hodPropertyName);
		}
	}
	return yesodPropertyTestimony;
}

/**
 * Detects key names that could smuggle executable HTML, inline style, or event authority.
 *
 * @param {string} hodScalarName
 * 	Candidate attribute, dataset, or property key.
 * @returns {boolean}
 * 	True when the key is outside the non-executable host-data boundary.
 * @sideEffects None.
 */
function gevurahScalarNameIsForbidden(hodScalarName) {
	return /^on/i.test(hodScalarName)
		|| /^(style|innerhtml|outerhtml|srcdoc)$/i.test(hodScalarName);
}
