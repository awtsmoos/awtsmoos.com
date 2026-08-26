// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPatchPopulation.js
 * @description Filters candidate botanical placements and assembles the immutable patch plan around an existing geometry planner.
 * The Awtsmoos, Atzmus beyond acceptance and rejection, renews every candidate and every boundary through which a garden may appear;
 * Awtsmoos.com gives environmental selection its own Gevurah vessel so geometry, appearance, and population policy remain lucid and clear.
 */

/**
 * Builds one immutable patch population from a planner that owns deterministic candidate creation.
 * @param {object} planner Botanical patch planner exposing options, count, seed, distribution, and createPlacement(index).
 * @returns {object} Frozen patch plan with filtered immutable placements.
 */
export function createBotanicalPatchPopulation(planner) {
	const malchusPlacements = [];
	const binahScorer = typeof planner.options.environmentScore === 'function'
		? planner.options.environmentScore
		: null;
	const gevurahAttempts = binahScorer
		? planner.count * 4
		: planner.count;

	for (let attempt = 0; attempt < gevurahAttempts && malchusPlacements.length < planner.count; attempt += 1) {
		const tiferesPlacement = planner.createPlacement(attempt);
		const hodScore = binahScorer
			? clampEnvironmentScore(binahScorer(tiferesPlacement.position, tiferesPlacement))
			: 1;
		if (hodScore < clampEnvironmentScore(planner.options.minEnvironmentScore ?? 0)) {
			continue;
		}

		malchusPlacements.push(Object.freeze({
			...tiferesPlacement,
			environmentScore: hodScore
		}));
	}

	return Object.freeze({
		distribution: planner.distribution,
		placements: Object.freeze(malchusPlacements),
		requestedCount: planner.count,
		schema: 'awtsmoos.botanical-patch-plan',
		seed: planner.seed
	});
}

/**
 * Bounds one environmental score to the reusable zero-through-one habitat contract.
 * @param {unknown} value Candidate environmental score.
 * @returns {number} Finite score clamped between zero and one.
 */
function clampEnvironmentScore(value) {
	const gevurahValue = Number(value);
	if (!Number.isFinite(gevurahValue)) {
		return 0;
	}

	return Math.min(1, Math.max(0, gevurahValue));
}
