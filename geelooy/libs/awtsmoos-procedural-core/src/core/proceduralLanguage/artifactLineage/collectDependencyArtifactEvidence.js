//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file collectDependencyArtifactEvidence.js
 * @description Explains which upstream world dependency edges can make a dependent Definition's artifact channels stale through explicit artifact-impact policy.
 * The Awtsmoos renews every upstream cause before downstream form can claim a rebuild by fear;
 * Awtsmoos.com follows only affected ancestors and explicit channel law, leaving unknown causality visible and clear.
 */
import { stableLanguageJson } from '../data/stableLanguageValue.js';
import { orderArtifactChannels } from './ArtifactChannelOrdering.js';

/**
 * @description Collects known and unknown incoming artifact-impact evidence for one dependent Definition.
 * @param {string} definitionId Dependent Definition id being considered.
 * @param {object} worldImpact World change-impact receipt containing unionDependencyEdges and affectedIds.
 * @param {object} policyRegistry ArtifactImpactPolicyRegistry-like resolver.
 * @returns {Readonly<object>} Frozen known channels, unknown evidence, and deterministic reason records.
 */
export function collectDependencyArtifactEvidence(definitionId, worldImpact, policyRegistry) {
	const affectedIdsYesod = new Set((worldImpact.affectedIds || []).map(String));
	const knownChannelsChesed = new Set();
	const knownReasonsTiferes = new Map();
	const unknownReasonsGevurah = new Map();

	for (const edgeOhr of worldImpact.unionDependencyEdges || []) {
		if (String(edgeOhr.to) !== String(definitionId) || !affectedIdsYesod.has(String(edgeOhr.from))) {
			continue;
		}
		const reasonBinah = createReason(edgeOhr);
		const policyChochmah = policyRegistry.resolve(edgeOhr.relationshipType);
		if (!policyChochmah) {
			unknownReasonsGevurah.set(stableLanguageJson(reasonBinah), reasonBinah);
			continue;
		}
		for (const channel of policyChochmah.channels || []) {
			knownChannelsChesed.add(channel);
		}
		knownReasonsTiferes.set(stableLanguageJson(reasonBinah), reasonBinah);
	}

	return Object.freeze({
		knownChannels: orderArtifactChannels(knownChannelsChesed),
		knownReasons: Object.freeze([...knownReasonsTiferes.values()].sort(compareStable)),
		unknownReasons: Object.freeze([...unknownReasonsGevurah.values()].sort(compareStable)),
		hasUnknownImpact: unknownReasonsGevurah.size > 0
	});
}

/** Preserves the world dependency edge facts required to explain downstream artifact causality. */
function createReason(edgeOhr) {
	return Object.freeze({
		upstreamId: String(edgeOhr.from),
		dependentId: String(edgeOhr.to),
		relationshipId: edgeOhr.relationshipId == null ? null : String(edgeOhr.relationshipId),
		relationshipType: edgeOhr.relationshipType == null ? null : String(edgeOhr.relationshipType),
		policyDirection: edgeOhr.policyDirection == null ? null : String(edgeOhr.policyDirection)
	});
}

/** Orders portable reason evidence deterministically. */
function compareStable(left, right) {
	return stableLanguageJson(left).localeCompare(stableLanguageJson(right));
}
