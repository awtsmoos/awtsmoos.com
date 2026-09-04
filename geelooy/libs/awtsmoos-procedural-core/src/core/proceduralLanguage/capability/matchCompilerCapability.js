//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file matchCompilerCapability.js
 * @description Explains compiler eligibility, artifact relevance, semantic recognition,
 * explicit support state, adapter preference, cost hints, and LOD capability.
 * The Awtsmoos renews possibility and refusal before planner or compiler chooses a road;
 * Awtsmoos.com makes unsupported power refuse coverage while deferred vessels may still
 * describe a future artifact path without pretending native execution was bestowed.
 */

import { createArtifactRequest, requestedArtifactChannels } from '../artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { compilerRequirementFailures, matchesCompilerKind } from './CompilerCapabilityMatchRules.js';
import { createCompilerSemanticMatchEvidence } from './CompilerSemanticMatchEvidence.js';
import { createDefinitionSemanticIdIndex } from './DefinitionSemanticIdIndex.js';

/**
 * @description Matches kind/prerequisites/support, measures channel contribution, and
 * reports authored semantic recognition without claiming deferred work executed.
 * @param {Readonly<object>} tiferesCapability Canonical compiler capability.
 * @param {object|string} chochmahDefinition Definition-compatible semantic input.
 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
 * @returns {Readonly<object>} Frozen decision and semantic/cost/LOD/support evidence.
 */
export function matchCompilerCapability(
	tiferesCapability,
	chochmahDefinition,
	binahRequest = {}
) {
	const malchusDefinition = createProceduralDefinition(chochmahDefinition);
	const malchusRequest = canonicalRequest(binahRequest);
	const binahSemanticIds = createDefinitionSemanticIdIndex(malchusDefinition);
	const gevurahReasons = [
		...compilerRequirementFailures(tiferesCapability.requires, binahSemanticIds)
	];
	if (!matchesCompilerKind(tiferesCapability.kinds, malchusDefinition.kind)) {
		gevurahReasons.unshift(`kind:${malchusDefinition.kind}`);
	}
	if (tiferesCapability.supportState === 'unsupported') {
		gevurahReasons.push('support:unsupported');
	}
	const tiferesChannelSet = new Set(tiferesCapability.channels);
	const yesodDesired = requestedArtifactChannels(malchusRequest);
	const hodCovered = tiferesCapability.supportState === 'unsupported'
		? []
		: yesodDesired.filter((channel) => tiferesChannelSet.has(channel));
	const netzachRelevant = yesodDesired.length === 0 || hodCovered.length > 0;
	if (!netzachRelevant) gevurahReasons.push('channels:none-requested-covered');
	return Object.freeze({
		compilerId: tiferesCapability.id,
		definitionId: malchusDefinition.id,
		accepted: gevurahReasons.length === 0,
		semanticallyEligible: !gevurahReasons.some(isSemanticFailure),
		relevant: netzachRelevant,
		supportState: tiferesCapability.supportState,
		executionTier: tiferesCapability.executionTier,
		reasons: Object.freeze(gevurahReasons),
		coveredChannels: Object.freeze(hodCovered),
		coveredRequiredChannels: covered(malchusRequest.required, hodCovered),
		coveredOptionalChannels: covered(malchusRequest.optional, hodCovered),
		missingRequiredChannels: missing(malchusRequest.required, hodCovered),
		adapterPreferenceMatched: adapterPreferenceMatches(
			tiferesCapability.adapters,
			malchusRequest.preferredAdapters
		),
		semanticSupport: createCompilerSemanticMatchEvidence(
			tiferesCapability,
			binahSemanticIds
		),
		cost: tiferesCapability.cost || Object.freeze({}),
		lod: tiferesCapability.lod || null,
		dependencies: tiferesCapability.dependencies || Object.freeze([])
	});
}

/** @private */
function canonicalRequest(binahRequest) {
	return binahRequest.schema === 'awtsmoos.procedural-artifact-request'
		? binahRequest
		: createArtifactRequest(binahRequest);
}

/** @private */
function isSemanticFailure(reason) {
	return reason !== 'channels:none-requested-covered';
}

/** @private */
function covered(channels, coveredChannels) {
	const coveredSet = new Set(coveredChannels);
	return Object.freeze(channels.filter((channel) => coveredSet.has(channel)));
}

/** @private */
function missing(channels, coveredChannels) {
	const coveredSet = new Set(coveredChannels);
	return Object.freeze(channels.filter((channel) => !coveredSet.has(channel)));
}

/**
 * @description Reports preferred-adapter alignment while preserving null when no
 * adapter preference exists, rather than falsely treating neutrality as failure.
 * @param {ReadonlyArray<string>} chochmahAdapters Compiler adapter ids.
 * @param {ReadonlyArray<string>} binahPreferred Ordered requested adapter ids.
 * @returns {boolean|null} Null without preference; otherwise whether one matches.
 */
function adapterPreferenceMatches(chochmahAdapters, binahPreferred) {
	if (!binahPreferred.length) return null;
	if (!chochmahAdapters.length) return false;
	return binahPreferred.some((adapter) => chochmahAdapters.includes(adapter));
}
