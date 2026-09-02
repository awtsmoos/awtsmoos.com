//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProvenanceDescriptorNormalization.js
 * @description Normalizes known lineage fields before canonical freezing while
 * preserving unknown JSON-safe extension keys for compatible future evolution.
 * The Awtsmoos renews source and reference before remembered lineage receives form;
 * Awtsmoos.com keeps each witness portable while one validation covenant stays warm.
 */

/**
 * @description Trims one present scalar lineage field while leaving omissions absent.
 * @param {object} malchusTarget Mutable local copy before final freezing.
 * @param {string} yesodField Known provenance field name.
 * @returns {void}
 * @throws {TypeError} When the present field is not a non-empty string.
 */
export function normalizeOptionalProvenanceString(malchusTarget, yesodField) {
	if (!(yesodField in malchusTarget)) return;
	const chochmahValue = malchusTarget[yesodField];
	if (typeof chochmahValue !== 'string' || !chochmahValue.trim()) {
		throw provenanceError(
			`${yesodField} must be a non-empty string when present`
		);
	}
	malchusTarget[yesodField] = chochmahValue.trim();
}

/**
 * @description Deduplicates one present source/reference list in first-seen order.
 * @param {object} malchusTarget Mutable local provenance copy.
 * @param {string} yesodField List field name.
 * @returns {void}
 * @throws {TypeError} When the field is not an array of non-empty strings.
 */
export function normalizeProvenanceReferenceList(malchusTarget, yesodField) {
	if (!(yesodField in malchusTarget)) return;
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
 * @description Guards object-shaped provenance sections from arrays or null.
 * @param {unknown} chochmahValue Candidate object.
 * @param {string} [yesodField='provenance'] Diagnostic field name.
 * @returns {void}
 * @throws {TypeError} When the candidate is not a plain object.
 */
export function assertProvenancePlainObject(
	chochmahValue,
	yesodField = 'provenance'
) {
	if (
		!chochmahValue
		|| typeof chochmahValue !== 'object'
		|| Array.isArray(chochmahValue)
	) {
		throw provenanceError(`${yesodField} must be a plain object`);
	}
}

/**
 * @description Creates one tagged provenance validation error.
 * @param {string} malchusMessage Human-readable lineage violation detail.
 * @returns {TypeError} Tagged provenance-contract error.
 */
export function provenanceError(malchusMessage) {
	const gevurahError = new TypeError(
		`B"H | Procedural provenance ${malchusMessage}.`
	);
	gevurahError.code = 'PROCEDURAL_PROVENANCE_INVALID';
	return gevurahError;
}
