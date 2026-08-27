//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RadianceScorer
 * @description
 * The scorer does not declare a soul valuable. It measures only the supplied
 * public discovery evidence. Like narrow rays passing through stained glass,
 * each contribution remains visible so Awtsmoos.com can explain every result.
 */

const { RADIANCE_LIMITS } = require('./RadianceWeights.js');
const { normalizeCandidate } = require('./RadianceSignal.js');

/**
 * Converts one normalized contribution into a human-readable reason.
 *
 * @param {string} signalName The signal identifier.
 * @param {number} contribution The weighted contribution.
 * @returns {Object} A stable explanation record.
 */
function reasonFor(signalName, contribution) {
	return {
		code: signalName,
		direction: contribution >= 0 ? 'supports' : 'reduces',
		contribution: Number(contribution.toFixed(4))
	};
}

/**
 * Scores one candidate while preserving its full contribution ledger.
 *
 * @param {Object} candidate A raw public candidate.
 * @param {Object<string, number>} weights The bounded scoring weights.
 * @returns {Object} Candidate, score, and explanations.
 */
function scoreCandidate(candidate, weights) {
	const normalizedCandidate = normalizeCandidate(candidate);
	const reasons = [];
	let weightedTotal = 0;
	let positiveCapacity = 0;

	for (const [signalName, weight] of Object.entries(weights)) {
		const signalValue = normalizedCandidate.signals[signalName] || 0;
		const contribution = signalValue * weight;
		weightedTotal += contribution;
		if (weight > 0) positiveCapacity += weight;
		if (Math.abs(contribution) >= 0.01) {
			reasons.push(reasonFor(signalName, contribution));
		}
	}

	const normalizedTotal = positiveCapacity > 0 ? weightedTotal / positiveCapacity : 0;
	const boundedUnit = Math.max(0, Math.min(1, normalizedTotal));
	const scoreRange = RADIANCE_LIMITS.maximumScore - RADIANCE_LIMITS.minimumScore;
	const score = RADIANCE_LIMITS.minimumScore + boundedUnit * scoreRange;

	return {
		...normalizedCandidate,
		radianceScore: Number(score.toFixed(2)),
		reasons: reasons.sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
	};
}

module.exports = {
	reasonFor,
	scoreCandidate
};
