//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RadianceRanker
 * @description
 * A feed should resemble a city of many windows, not one tower reflected fifty
 * times. This ranker orders the measured light, then softly limits repeated
 * contexts so discovery on Awtsmoos.com remains varied and understandable.
 */

const { RADIANCE_LIMITS, createRadianceWeights } = require('./RadianceWeights.js');
const { scoreCandidate } = require('./RadianceScorer.js');

/**
 * Applies a small context repetition penalty after the pure score is known.
 *
 * @param {Object[]} rankedCandidates Candidates sorted by raw radiance.
 * @returns {Object[]} Diversity-adjusted candidates.
 */
function applyContextDiversity(rankedCandidates) {
	const contextCounts = new Map();

	return rankedCandidates.map(candidate => {
		const contextKey = candidate.context || `${candidate.type}:public`;
		const seenCount = contextCounts.get(contextKey) || 0;
		contextCounts.set(contextKey, seenCount + 1);
		const penalty = Math.min(18, seenCount * 4);
		const adjustedScore = Math.max(0, candidate.radianceScore - penalty);

		return {
			...candidate,
			radianceScore: Number(adjustedScore.toFixed(2)),
			reasons: penalty > 0
				? [...candidate.reasons, { code: 'contextRepetition', direction: 'reduces', contribution: -penalty / 100 }]
				: candidate.reasons
		};
	});
}

/**
 * Produces a deterministic ranked list from supplied public candidates.
 *
 * @param {Object[]} candidates Raw candidates.
 * @param {Object} [options] Limit and weight overrides.
 * @returns {Object[]} Ranked candidates.
 */
function rankByRadiance(candidates = [], options = {}) {
	const safeCandidates = Array.isArray(candidates)
		? candidates.slice(0, RADIANCE_LIMITS.maximumCandidates)
		: [];
	const weights = createRadianceWeights(options.weights);
	const requestedLimit = Number(options.limit || 20);
	const limit = Math.max(1, Math.min(RADIANCE_LIMITS.maximumResults, requestedLimit));
	const scored = safeCandidates
		.filter(candidate => candidate && candidate.id)
		.map(candidate => scoreCandidate(candidate, weights))
		.sort((left, right) => {
			if (right.radianceScore !== left.radianceScore) {
				return right.radianceScore - left.radianceScore;
			}
			if (right.createdAt !== left.createdAt) {
				return right.createdAt - left.createdAt;
			}
			return left.id.localeCompare(right.id);
		});

	return applyContextDiversity(scored)
		.sort((left, right) => right.radianceScore - left.radianceScore || left.id.localeCompare(right.id))
		.slice(0, limit);
}

module.exports = {
	applyContextDiversity,
	rankByRadiance
};
