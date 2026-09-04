//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDefinitionArtifactDecision.js
 * @description Coordinates one affected Definition into selective channel actions while delegating evidence mechanics to focused helpers.
 * The Awtsmoos renews each Definition before direct and propagated causes can gather around its light;
 * Awtsmoos.com lets the coordinator choose precedence while smaller vessels preserve every reason in sight.
 */
import { requestedArtifactChannels } from '../artifact/createArtifactRequest.js';
import { ARTIFACT_LINEAGE_ACTIONS, ARTIFACT_LINEAGE_REASONS } from './ArtifactLineageProtocol.js';
import { orderArtifactChannels } from './ArtifactChannelOrdering.js';
import {
	addArtifactDecisionReason,
	applyDependencyArtifactEvidence,
	applyDirectArtifactEvidence,
	compareArtifactDecisionReasons,
	createRemovedArtifactDecision,
	orderArtifactChannelsByRequest
} from './ArtifactDecisionEvidence.js';
import { createArtifactRequestSubset, selectArtifactRequestChannels } from './createArtifactRequestSubset.js';

/**
 * @description Creates one deterministic per-Definition artifact decision without invoking compiler planning, execution, or cache.
 * @param {object} input Decision evidence and request intent.
 * @returns {Readonly<object>|null} Frozen plan entry or null when no channel-level artifact work is proven.
 */
export function createDefinitionArtifactDecision(input = {}) {
	const {
		definitionId,
		request,
		isAdded = false,
		isRemoved = false,
		isContentChanged = false,
		contentHash = null,
		patchChain = null,
		dependencyEvidence = null
	} = input;
	if (isRemoved) {
		return createRemovedArtifactDecision(definitionId, contentHash, request);
	}

	const requestedChannels = requestedArtifactChannels(request);
	const stateBinah = {
		patchChain,
		dependencyEvidence,
		requestedChannels,
		requestedSet: new Set(requestedChannels),
		regenerate: new Set(),
		reconsider: new Set(),
		latent: new Set(),
		reasons: new Map()
	};
	if (isAdded) {
		requestedChannels.forEach((channel) => stateBinah.regenerate.add(channel));
		addArtifactDecisionReason(stateBinah.reasons, ARTIFACT_LINEAGE_REASONS.DEFINITION_ADDED);
	} else if (isContentChanged) {
		applyDirectArtifactEvidence(stateBinah);
	}
	applyDependencyArtifactEvidence(stateBinah);
	stateBinah.regenerate.forEach((channel) => stateBinah.reconsider.delete(channel));

	const regenerateChesed = orderArtifactChannelsByRequest(request, stateBinah.regenerate);
	const reconsiderGevurah = orderArtifactChannelsByRequest(request, stateBinah.reconsider);
	const latentHod = orderArtifactChannels(stateBinah.latent);
	if (regenerateChesed.length === 0 && reconsiderGevurah.length === 0 && latentHod.length === 0) {
		return null;
	}
	const action = regenerateChesed.length > 0
		? ARTIFACT_LINEAGE_ACTIONS.REGENERATE
		: reconsiderGevurah.length > 0
			? ARTIFACT_LINEAGE_ACTIONS.RECONSIDER
			: ARTIFACT_LINEAGE_ACTIONS.LATENT_STALE;
	return Object.freeze({
		definitionId: String(definitionId),
		contentHash,
		action,
		regenerate: selectArtifactRequestChannels(request, regenerateChesed),
		reconsider: selectArtifactRequestChannels(request, reconsiderGevurah),
		latentStaleChannels: latentHod,
		request: regenerateChesed.length > 0 ? createArtifactRequestSubset(request, regenerateChesed) : null,
		reasons: Object.freeze([...stateBinah.reasons.values()].sort(compareArtifactDecisionReasons)),
		patchEvidence: patchChain?.complete ? patchChain.receipts : Object.freeze([]),
		dependencyEvidence: dependencyEvidence || null,
		diagnostics: Object.freeze([...(patchChain?.diagnostics || [])])
	});
}
