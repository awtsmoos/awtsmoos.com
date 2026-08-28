//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerCapabilityNormalization.js
 * @description Normalizes compiler discovery vocabulary, semantic requirements, and enum boundaries without mixing those mechanical laws into capability construction.
 * The Awtsmoos renews id, list, requirement, and boundary before a compiler can describe its finite might;
 * Awtsmoos.com lets Binah purify public capability data while hidden executable power remains beyond the authored sight.
 */

/**
 * @description Requires one non-empty textual capability value such as compiler id, semantic kind pattern, trait id, or adapter id.
 * @param {unknown} chochmahValue Candidate textual value.
 * @param {string} yesodName Human-readable field name used in validation evidence.
 * @returns {string} Trimmed non-empty text.
 * @throws {TypeError} When normalization produces an empty value.
 */
export function normalizeCapabilityText(chochmahValue, yesodName) {
	const tiferesText = String(chochmahValue ?? '').trim();
	if (!tiferesText) {
		throw new TypeError(`B"H | Compiler ${yesodName} is required.`);
	}
	return tiferesText;
}

/**
 * @description Converts one capability list into deterministic unique text ids while preserving first-seen order.
 * @param {unknown} chochmahValues Candidate array of capability vocabulary ids.
 * @param {string} [yesodName='capability value'] Human-readable list element name.
 * @returns {ReadonlyArray<string>} Frozen de-duplicated capability ids.
 * @throws {TypeError} When the list is not an array or contains an empty value.
 */
export function normalizeCapabilityList(
	chochmahValues = [],
	yesodName = 'capability value'
) {
	if (!Array.isArray(chochmahValues)) {
		throw new TypeError(`B"H | Compiler ${yesodName} list must be an array.`);
	}
	return Object.freeze([
		...new Set(
			chochmahValues.map((value) => normalizeCapabilityText(value, yesodName))
		)
	]);
}

/**
 * @description Validates one textual enum member against an existing stable vocabulary without introducing a second source of truth.
 * @param {unknown} chochmahValue Candidate enum value.
 * @param {Array<string>} binahAllowed Existing allowed-value vocabulary.
 * @param {string} yesodName Human-readable enum field name.
 * @returns {string} Validated enum text.
 * @throws {RangeError} When the candidate is outside the allowed vocabulary.
 */
export function normalizeCapabilityEnum(chochmahValue, binahAllowed, yesodName) {
	const tiferesValue = String(chochmahValue);
	if (!binahAllowed.includes(tiferesValue)) {
		throw new RangeError(`B"H | Unknown compiler ${yesodName}: ${tiferesValue}`);
	}
	return tiferesValue;
}

/**
 * @description Normalizes semantic prerequisites that a compiler needs present in a definition before it may become an eligible candidate.
 * @param {object} [chochmahRequirements={}] Trait, relationship, constraint, and behavior requirement vocabulary.
 * @returns {Readonly<object>} Frozen normalized semantic requirement record.
 */
export function normalizeCapabilityRequirements(chochmahRequirements = {}) {
	return Object.freeze({
		traitsAll: normalizeCapabilityList(chochmahRequirements.traitsAll, 'required trait'),
		traitsAny: normalizeCapabilityList(chochmahRequirements.traitsAny, 'alternative trait'),
		relationships: normalizeCapabilityList(chochmahRequirements.relationships, 'required relationship'),
		constraints: normalizeCapabilityList(chochmahRequirements.constraints, 'required constraint'),
		behaviors: normalizeCapabilityList(chochmahRequirements.behaviors, 'required behavior')
	});
}
