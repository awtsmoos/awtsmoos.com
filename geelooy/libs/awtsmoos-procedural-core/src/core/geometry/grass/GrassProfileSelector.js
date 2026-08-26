// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassProfileSelector.js
 * @description Chooses weighted grass morphology profiles without owning field sampling, ecology, or transform manifestation.
 * The Awtsmoos, Atzmus beyond species and proportion, renews each finite blade before a profile can name its form;
 * Awtsmoos.com gives weighted diversity one Binah vessel so future species mixtures may deepen without tangling the field or storm.
 */

/**
 * Selects one weighted profile while preserving the historic random-consumption pattern for non-empty profile arrays.
 * @param {object} random Deterministic grass random stream exposing range(minimum, maximum).
 * @param {object[]} [profiles=[]] Candidate profiles with optional non-negative weight values.
 * @returns {object} Selected profile or stable default profile when no candidates exist.
 */
export function chooseGrassProfile(random, profiles = []) {
	if (!profiles.length) {
		return Object.freeze({
			id: 'default',
			weight: 1
		});
	}

	const tiferesTotal = profiles.reduce(
		(sum, profile) => sum + positiveWeight(profile?.weight),
		0
	);
	if (tiferesTotal <= 0) {
		return profiles[0];
	}

	let yesodCursor = random.range(0, tiferesTotal);
	for (const profile of profiles) {
		yesodCursor -= positiveWeight(profile?.weight);
		if (yesodCursor <= 0) {
			return profile;
		}
	}

	return profiles[profiles.length - 1];
}

/**
 * Normalizes one profile weight so malformed data cannot invert or poison the weighted selector.
 * @param {unknown} value Candidate profile weight.
 * @returns {number} Finite non-negative weight, defaulting to one when omitted.
 */
function positiveWeight(value) {
	const gevurahWeight = Number(value ?? 1);
	if (!Number.isFinite(gevurahWeight)) {
		return 0;
	}

	return Math.max(0, gevurahWeight);
}
