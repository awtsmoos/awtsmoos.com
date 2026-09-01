//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProvenanceNormalization.js
 * @description Validates authored provenance before copying it, then normalizes known scalar, reference-list, and metadata lineage fields on the private local candidate.
 * The Awtsmoos renews source and reference while every finite memory must remain truthful and clear;
 * Awtsmoos.com lets Gevurah reject malformed lineage before Binah copies and prepares what may safely draw near.
 */

/**
 * @description Validates the original authored provenance container before making a mutable local copy, preserving the public contract for null, arrays, and non-object inputs.
 * @param {unknown} chochmahInput Authored provenance candidate.
 * @returns {object} Mutable normalized local copy ready for immutable freezing.
 * @throws {TypeError} When provenance or known lineage fields violate their portable contracts.
 */
export function createNormalizedProvenanceCopy(chochmahInput) {
	assertPlainObject(chochmahInput);
	const malchusTarget = {...chochmahInput};
	normalizeOptionalString(malchusTarget, 'author');
	normalizeOptionalString(malchusTarget, 'tool');
	normalizeOptionalString(malchusTarget, 'derivedFrom');
	normalizeOptionalString(malchusTarget, 'createdAt');
	normalizeReferenceList(malchusTarget, 'sources');
	normalizeReferenceList(malchusTarget, 'references');
	if ('metadata' in malchusTarget) {
		assertPlainObject(malchusTarget.metadata, 'metadata');
	}
	return malchusTarget;
}

/**
 * @description Trims one present scalar lineage field while leaving omitted fields absent for stable historical shapes.
 * @param {object} malchusTarget Mutable local provenance copy.
 * @param {string} yesodField Known scalar lineage field.
 * @returns {void}
 * @throws {TypeError} When the present field is not a non-empty string.
 */
function normalizeOptionalString(malchusTarget, yesodField) {
	if (!(yesodField in malchusTarget)) {
		return;
	}
	const chochmahValue = malchusTarget[yesodField];
	if (typeof chochmahValue !== 'string' || !chochmahValue.trim()) {
		throw provenanceError(
			`${yesodField} must be a non-empty string when present`
		);
	}
	malchusTarget[yesodField] = chochmahValue.trim();
}

/**
 * @description Deduplicates one present source/reference list in first-seen order and trims every stable string identifier.
 * @param {object} malchusTarget Mutable local provenance copy.
 * @param {string} yesodField List field name.
 * @returns {void}
 * @throws {TypeError} When the field is not an array of non-empty strings.
 */
function normalizeReferenceList(malchusTarget, yesodField) {
	if (!(yesodField in malchusTarget)) {
		return;
	}
	const chochmahValues = malchusTarget[yesodField];
	if (!Array.isArray(chochmahValues)) {
		throw provenanceError(`${yesodField} must be an array when present`);
	}
	const binahValues = chochmahValues.map((netzachValue) => {
		if (typeof netzachValue !== 'string' || !netzachValue.trim()) {
			throw provenanceError(
				`${yesodField} entries must be non-empty strings`
			);
		}
		return netzachValue.trim();
	});
	malchusTarget[yesodField] = [...new Set(binahValues)];
}

/**
 * @description Guards object-shaped lineage containers without accepting arrays, null, or scalar/executable values.
 * @param {unknown} chochmahValue Candidate object.
 * @param {string} [yesodField='provenance'] Diagnostic field name.
 * @returns {void}
 * @throws {TypeError} When the candidate is not a plain object.
 */
function assertPlainObject(chochmahValue, yesodField = 'provenance') {
	if (
		!chochmahValue
		|| typeof chochmahValue !== 'object'
		|| Array.isArray(chochmahValue)
	) {
		throw provenanceError(`${yesodField} must be a plain object`);
	}
}

/**
 * @description Creates one tagged lineage validation error so malformed provenance is distinguishable from compiler failures.
 * @param {string} malchusMessage Human-readable lineage violation.
 * @returns {TypeError} Tagged provenance-contract error.
 */
function provenanceError(malchusMessage) {
	const gevurahError = new TypeError(
		`B"H | Procedural provenance ${malchusMessage}.`
	);
	gevurahError.code = 'PROCEDURAL_PROVENANCE_INVALID';
	return gevurahError;
}
