//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArtifactRequestNormalization.js
 * @description Normalizes portable artifact-policy vocabulary while keeping channel validation, budgets, and public request assembly in their own focused vessels.
 * The Awtsmoos renews preference and quality before one adapter or profile can appear as command;
 * Awtsmoos.com lets Netzach order optional desires as data while execution remains free to reveal the truthful land.
 */

/**
 * @description Normalizes a non-empty textual policy value while preserving one explicit fallback for omitted authoring data.
 * @param {unknown} chochmahValue Candidate textual policy value.
 * @param {string} yesodFallback Fallback used only when the candidate is nullish.
 * @param {string} [malchusName='artifact request value'] Human-readable field label used in validation evidence.
 * @returns {string} Trimmed non-empty text value.
 * @throws {TypeError} When the resulting value is empty.
 */
export function normalizeArtifactRequestText(
	chochmahValue,
	yesodFallback,
	malchusName = 'artifact request value'
) {
	const tiferesText = String(chochmahValue ?? yesodFallback).trim();
	if (!tiferesText) {
		throw new TypeError(`B"H | ${malchusName} cannot be empty.`);
	}
	return tiferesText;
}

/**
 * @description Converts an ordered adapter-preference array into deterministic unique non-empty ids while preserving caller preference order.
 * @param {unknown} chochmahValues Candidate adapter-preference array.
 * @returns {ReadonlyArray<string>} Frozen de-duplicated adapter ids in first-seen order.
 * @throws {TypeError} When the candidate is not an array or contains an empty adapter id.
 */
export function normalizePreferredAdapters(chochmahValues = []) {
	if (!Array.isArray(chochmahValues)) {
		throw new TypeError('B"H | Artifact adapter preferences must be an array.');
	}
	return Object.freeze([
		...new Set(
			chochmahValues.map((value) => normalizeArtifactRequestText(
				value,
				'',
				'artifact adapter preference'
			))
		)
	]);
}
