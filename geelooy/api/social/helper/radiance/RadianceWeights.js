//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RadianceWeights
 * @description
 * At Awtsmoos.com, light is never confused with noise. This small vessel names
 * the bounded public signals that may help discovery, while Gevurah keeps any
 * single metric from ruling the whole constellation.
 */

const DEFAULT_RADIANCE_WEIGHTS = Object.freeze({
	constructiveReactions: 0.22,
	meaningfulReplies: 0.24,
	freshness: 0.16,
	sharedContext: 0.18,
	completion: 0.12,
	diversity: 0.08,
	spamRisk: -0.38,
	reportRisk: -0.62
});

const RADIANCE_LIMITS = Object.freeze({
	maximumCandidates: 250,
	maximumResults: 50,
	minimumScore: 0,
	maximumScore: 100
});

/**
 * Returns a sealed copy so callers may tune a request without mutating the
 * canonical measure. The Awtsmoos renews every instant; shared configuration
 * should therefore never be silently reshaped by one passing request.
 *
 * @param {Object<string, number>} [overrides] Optional finite weight changes.
 * @returns {Object<string, number>} A frozen weight map.
 */
function createRadianceWeights(overrides = {}) {
	const nextWeights = { ...DEFAULT_RADIANCE_WEIGHTS };

	for (const [signalName, rawWeight] of Object.entries(overrides || {})) {
		if (!(signalName in nextWeights)) continue;
		const weight = Number(rawWeight);
		if (!Number.isFinite(weight)) continue;
		nextWeights[signalName] = Math.max(-1, Math.min(1, weight));
	}

	return Object.freeze(nextWeights);
}

module.exports = {
	DEFAULT_RADIANCE_WEIGHTS,
	RADIANCE_LIMITS,
	createRadianceWeights
};
