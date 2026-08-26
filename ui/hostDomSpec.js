//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomSpec
 * @description
 * The Awtsmoos pours infinite possibility into finite kelim, and Gevurah decides which
 * vessels may safely receive that light. Awtsmoos.com uses this module as the boundary
 * around host-owned UI data: no hidden HTML, no executable strings, no wandering style,
 * only a small declarative grammar whose truth can be inspected before Malchus appears.
 */

const GEVURAH_ALLOWED_TAGS = new Set([
	"aside", "button", "canvas", "div", "h1", "h2", "h3", "header", "input",
	"main", "nav", "p", "pre", "section", "span", "textarea"
]);
const GEVURAH_ALLOWED_FIELDS = new Set([
	"attributes", "children", "classes", "dataset", "properties", "ref", "tag", "text"
]);
const GEVURAH_ALLOWED_PROPERTIES = new Set([
	"autocomplete", "disabled", "hidden", "max", "min", "placeholder", "readOnly",
	"spellcheck", "tabIndex", "type", "value"
]);

/**
 * Validates and normalizes one host-DOM declaration into a frozen recursive spec.
 *
 * @param {Object} keterCandidateSpec
 * 	Declarative host UI node proposed by a component's Keter-level intent.
 * @returns {Object}
 * 	A recursively normalized and frozen specification safe for host manifestation.
 * @throws {Error}
 * 	When a field, tag, ref, scalar record, property, or child violates the grammar.
 * @sideEffects None. The function is pure and never touches the DOM.
 */
export function gevurahNormalizeHostDomSpec(keterCandidateSpec) {
	gevurahAssertPlainRecord(keterCandidateSpec, "HOST_DOM_SPEC_REQUIRED");
	for (const hodFieldName of Object.keys(keterCandidateSpec)) {
		if (!GEVURAH_ALLOWED_FIELDS.has(hodFieldName)) {
			throw gevurahHostDomError("HOST_DOM_SPEC_FIELD_FORBIDDEN", hodFieldName);
		}
	}
	const malchusTagName = String(keterCandidateSpec.tag || "").toLowerCase();
	if (!GEVURAH_ALLOWED_TAGS.has(malchusTagName)) {
		throw gevurahHostDomError("HOST_DOM_SPEC_TAG_FORBIDDEN", malchusTagName);
	}
	const yesodRefName = normalizeOptionalRef(keterCandidateSpec.ref);
	return Object.freeze({
		attributes: yesodNormalizeScalarRecord(keterCandidateSpec.attributes, "attribute"),
		children: Object.freeze((keterCandidateSpec.children || []).map(gevurahNormalizeHostDomSpec)),
		classes: Object.freeze(binahNormalizeClasses(keterCandidateSpec.classes)),
		dataset: yesodNormalizeScalarRecord(keterCandidateSpec.dataset, "dataset"),
		properties: yesodNormalizeProperties(keterCandidateSpec.properties),
		ref: yesodRefName,
		tag: malchusTagName,
		text: hodNormalizeText(keterCandidateSpec.text)
	});
}

/**
 * Expands a compact class declaration into distinct, non-empty class tokens.
 *
 * @param {string|string[]|undefined} chochmahClassSeed Compact class declaration.
 * @returns {string[]} Normalized class-name tokens with duplicates removed.
 * @throws {Error} When any class token is not a string.
 * @sideEffects None.
 */
function binahNormalizeClasses(chochmahClassSeed) {
	const binahClassSeeds = chochmahClassSeed == null ? [] : [].concat(chochmahClassSeed);
	const tiferesClassNames = [];
	for (const hodClassSeed of binahClassSeeds) {
		if (typeof hodClassSeed !== "string") throw gevurahHostDomError("HOST_DOM_CLASS_INVALID");
		for (const netzachClassName of hodClassSeed.split(/\s+/).filter(Boolean)) {
			if (!tiferesClassNames.includes(netzachClassName)) tiferesClassNames.push(netzachClassName);
		}
	}
	return tiferesClassNames;
}

/**
 * Normalizes an attribute or dataset record while excluding executable/style-like keys.
 *
 * @param {Object|undefined} yesodCandidateRecord Candidate scalar record.
 * @param {string} hodRecordKind Human-readable record kind for failure testimony.
 * @returns {Object} Frozen scalar record suitable for renderer application.
 * @throws {Error} When keys or values violate the host-only grammar.
 * @sideEffects None.
 */
function yesodNormalizeScalarRecord(yesodCandidateRecord, hodRecordKind) {
	if (yesodCandidateRecord == null) return Object.freeze({});
	gevurahAssertPlainRecord(yesodCandidateRecord, `HOST_DOM_${hodRecordKind.toUpperCase()}S_INVALID`);
	const yesodNormalizedRecord = {};
	for (const [hodScalarName, hodScalarValue] of Object.entries(yesodCandidateRecord)) {
		if (/^on/i.test(hodScalarName) || /^(style|innerhtml|outerhtml|srcdoc)$/i.test(hodScalarName)) {
			throw gevurahHostDomError("HOST_DOM_SCALAR_KEY_FORBIDDEN", hodScalarName);
		}
		if (!["string", "number", "boolean"].includes(typeof hodScalarValue)) {
			throw gevurahHostDomError("HOST_DOM_SCALAR_VALUE_INVALID", hodScalarName);
		}
		yesodNormalizedRecord[hodScalarName] = hodScalarValue;
	}
	return Object.freeze(yesodNormalizedRecord);
}

/**
 * Restricts writable DOM properties to a deliberately small browser-chrome allowlist.
 *
 * @param {Object|undefined} yesodPropertySeed Candidate property record.
 * @returns {Object} Frozen normalized property record.
 * @throws {Error} When an unknown property is requested.
 * @sideEffects None.
 */
function yesodNormalizeProperties(yesodPropertySeed) {
	const yesodProperties = yesodNormalizeScalarRecord(yesodPropertySeed, "propertie");
	for (const hodPropertyName of Object.keys(yesodProperties)) {
		if (!GEVURAH_ALLOWED_PROPERTIES.has(hodPropertyName)) {
			throw gevurahHostDomError("HOST_DOM_PROPERTY_FORBIDDEN", hodPropertyName);
		}
	}
	return yesodProperties;
}

function normalizeOptionalRef(yesodCandidateRef) {
	if (yesodCandidateRef == null) return null;
	if (typeof yesodCandidateRef !== "string" || !/^[A-Za-z][A-Za-z0-9_]*$/.test(yesodCandidateRef)) {
		throw gevurahHostDomError("HOST_DOM_REF_INVALID", yesodCandidateRef);
	}
	return yesodCandidateRef;
}

function hodNormalizeText(hodCandidateText) {
	if (hodCandidateText == null) return null;
	if (!["string", "number"].includes(typeof hodCandidateText)) {
		throw gevurahHostDomError("HOST_DOM_TEXT_INVALID");
	}
	return String(hodCandidateText);
}

function gevurahAssertPlainRecord(yesodCandidateRecord, hodFailureCode) {
	if (!yesodCandidateRecord || typeof yesodCandidateRecord !== "object" || Array.isArray(yesodCandidateRecord)) {
		throw gevurahHostDomError(hodFailureCode);
	}
}

function gevurahHostDomError(hodCode, hodDetail = "") {
	const gevurahError = new Error(hodDetail ? `${hodCode}:${String(hodDetail)}` : hodCode);
	gevurahError.code = hodCode;
	return gevurahError;
}
