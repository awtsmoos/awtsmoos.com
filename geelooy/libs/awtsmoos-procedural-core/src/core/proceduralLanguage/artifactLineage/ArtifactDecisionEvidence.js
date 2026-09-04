//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArtifactDecisionEvidence.js
 * @description Holds pure channel-evidence operations so the per-Definition planner stays a small coordinator rather than a crowded decision engine.
 * The Awtsmoos renews each evidence stream before regeneration, retirement, and uncertainty can crowd one vessel's frame;
 * Awtsmoos.com separates Chesed and Gevurah of channel causality, so every later decision can explain its name.
 */
import { requestedArtifactChannels } from '../artifact/createArtifactRequest.js';
import { normalizeArtifactChannels } from '../artifact/ProceduralArtifactChannels.js';
import { stableLanguageJson } from '../data/stableLanguageValue.js';
import { ARTIFACT_LINEAGE_ACTIONS, ARTIFACT_LINEAGE_REASONS } from './ArtifactLineageProtocol.js';
import { selectArtifactRequestChannels } from './createArtifactRequestSubset.js';

/** Creates removal work without fabricating a compile request. */
export function createRemovedArtifactDecision(definitionId, contentHash, request) {
	const requestedChannels = requestedArtifactChannels(request);
	return Object.freeze({
		definitionId: String(definitionId),
		contentHash,
		action: ARTIFACT_LINEAGE_ACTIONS.RETIRE,
		retire: selectArtifactRequestChannels(request, requestedChannels),
		regenerate: selectArtifactRequestChannels(request, []),
		reconsider: selectArtifactRequestChannels(request, []),
		latentStaleChannels: Object.freeze([]),
		request: null,
		reasons: Object.freeze([Object.freeze({ code: ARTIFACT_LINEAGE_REASONS.DEFINITION_REMOVED })]),
		patchEvidence: Object.freeze([]),
		dependencyEvidence: null,
		diagnostics: Object.freeze([])
	});
}

/** Applies direct content-change evidence with patch-chain precision or explicit uncertainty. */
export function applyDirectArtifactEvidence(state) {
	const { patchChain, requestedSet, regenerate, reconsider, latent, reasons, requestedChannels } = state;
	if (!patchChain?.complete || patchChain.affectedChannels.length === 0) {
		requestedChannels.forEach((channel) => reconsider.add(channel));
		addArtifactDecisionReason(reasons, ARTIFACT_LINEAGE_REASONS.DIRECT_CONTENT_UNCERTAIN);
		return;
	}
	for (const channel of normalizeArtifactChannels(patchChain.affectedChannels)) {
		(requestedSet.has(channel) ? regenerate : latent).add(channel);
	}
	addArtifactDecisionReason(reasons, ARTIFACT_LINEAGE_REASONS.DIRECT_PATCH_CHANNELS);
}

/** Applies propagated dependency evidence without confusing compiler capability with artifact causality. */
export function applyDependencyArtifactEvidence(state) {
	const { dependencyEvidence, requestedSet, regenerate, reconsider, latent, reasons, requestedChannels } = state;
	if (!dependencyEvidence) {
		return;
	}
	for (const channel of dependencyEvidence.knownChannels || []) {
		(requestedSet.has(channel) ? regenerate : latent).add(channel);
	}
	if ((dependencyEvidence.knownReasons || []).length > 0) {
		addArtifactDecisionReason(reasons, ARTIFACT_LINEAGE_REASONS.DEPENDENCY_POLICY_CHANNELS);
	}
	if (dependencyEvidence.hasUnknownImpact) {
		requestedChannels.forEach((channel) => reconsider.add(channel));
		addArtifactDecisionReason(reasons, ARTIFACT_LINEAGE_REASONS.DEPENDENCY_POLICY_UNCERTAIN);
	}
}

/** Orders a channel set according to the canonical ArtifactRequest instead of incidental evidence order. */
export function orderArtifactChannelsByRequest(request, channels) {
	const channelSetYesod = new Set(channels);
	return Object.freeze(requestedArtifactChannels(request).filter((channel) => channelSetYesod.has(channel)));
}

/** Inserts one stable factual reason without allowing duplicate evidence to bloat the receipt. */
export function addArtifactDecisionReason(reasonMap, code) {
	const reasonOhr = Object.freeze({ code });
	reasonMap.set(stableLanguageJson(reasonOhr), reasonOhr);
}

/** Orders reason records deterministically for portable plan hashes. */
export function compareArtifactDecisionReasons(left, right) {
	return stableLanguageJson(left).localeCompare(stableLanguageJson(right));
}
