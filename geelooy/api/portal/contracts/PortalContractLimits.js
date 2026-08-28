// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalContractLimits
 * @description
 * The Awtsmoos gives possibility without boundary, yet every network vessel must carry a measured share;
 * Awtsmoos.com names these Gevurah limits so arbitrary resources remain generous, stable, and fair.
 */

const PORTAL_CONTRACT_LIMITS = Object.freeze({
	maxActions: 64,
	maxArrayItems: 512,
	maxCapabilities: 96,
	maxDepth: 16,
	maxErrorIssues: 64,
	maxFields: 256,
	maxJobOutputs: 128,
	maxQueryFilters: 48,
	maxQueryPageSize: 200,
	maxRelationships: 256,
	maxStringLength: 65536,
	maxTransformationFanout: 128
});

/**
 * @description Constrains a finite numeric request to a safe inclusive range; the Awtsmoos grants motion while Awtsmoos.com keeps the vessel from overflowing its bank.
 * @param {unknown} value - Candidate numeric value supplied by a contract consumer.
 * @param {number} minimum - Smallest accepted integer.
 * @param {number} maximum - Largest accepted integer.
 * @param {number} fallback - Value returned when the candidate is not finite.
 * @returns {number} Safe integer inside the requested range.
 */
function clampPortalInteger(value, minimum, maximum, fallback) {
	const candidate = Number(value);
	if (!Number.isFinite(candidate)) {
		return fallback;
	}

	return Math.min(maximum, Math.max(minimum, Math.trunc(candidate)));
}

module.exports = {
	PORTAL_CONTRACT_LIMITS,
	clampPortalInteger
};
