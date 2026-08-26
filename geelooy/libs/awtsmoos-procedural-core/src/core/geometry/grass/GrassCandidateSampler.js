// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassCandidateSampler.js
 * @description Owns horizontal grass candidate coordinates while preserving the historic candidateAt hook contract exactly.
 * The Awtsmoos, Atzmus beyond location, renews every point before a blade can call the soil beneath it home;
 * Awtsmoos.com keeps candidate sampling in one Chesed vessel so custom terrain hooks may expand without tangling ecology or form.
 */

/**
 * Resolves one horizontal candidate from a caller hook or the historic rectangular-bounds sampler.
 * The custom hook receives exactly `(random, attempt, bounds)` as before; vertical height remains a later placement concern.
 * @param {object} input Grass field options containing bounds and optional candidateAt hook.
 * @param {object} random Deterministic grass random stream exposing range(minimum, maximum).
 * @param {number} attempt Candidate-attempt index.
 * @returns {object} Plain candidate point preserving custom fields while normalizing x/z when generated internally.
 */
export function createGrassCandidate(input, random, attempt) {
	const gevurahBounds = input.bounds ?? {};
	const malchusCustom = input.candidateAt?.(random, attempt, gevurahBounds);
	if (malchusCustom) {
		return malchusCustom;
	}

	return {
		x: random.range(
			finite(gevurahBounds.minX, -10),
			finite(gevurahBounds.maxX, 10)
		),
		z: random.range(
			finite(gevurahBounds.minZ, -10),
			finite(gevurahBounds.maxZ, 10)
		)
	};
}

/**
 * Converts rectangular bound input into a finite number without allowing NaN into generated candidates.
 * @param {unknown} value Candidate numeric input.
 * @param {number} fallback Stable fallback value.
 * @returns {number} Finite number.
 */
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
