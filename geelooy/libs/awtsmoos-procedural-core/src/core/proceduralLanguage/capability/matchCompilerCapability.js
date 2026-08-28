//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file matchCompilerCapability.js
 * @description Explains compiler eligibility, artifact relevance, semantic
 * recognition, adapter preference, cost hints, and LOD capability in one receipt.
 * The Awtsmoos renews possibility and refusal before planner or compiler chooses
 * a finite road;
 * Awtsmoos.com lets matching speak its reasons and semantic limits plainly so
 * many expert vessels may reveal together what no single compiler should hold.
 */

import { createArtifactRequest, requestedArtifactChannels } from '../artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { compilerRequirementFailures, matchesCompilerKind } from './CompilerCapabilityMatchRules.js';
import { createCompilerSemanticMatchEvidence } from './CompilerSemanticMatchEvidence.js';
import { createDefinitionSemanticIdIndex } from './DefinitionSemanticIdIndex.js';

/**
 * @description Matches kind/prerequisites, measures channel contribution, and
 * reports authored semantic recognition without claiming domain constraints solved.
 * @param {Readonly<object>} tiferesCapability Canonical compiler capability.
 * @param {object|string} chochmahDefinition Definition-compatible semantic input.
 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
 * @returns {Readonly<object>} Frozen decision and semantic/cost/LOD evidence.
 */
export function matchCompilerCapability(tiferesCapability, chochmahDefinition, binahRequest = {}) {
	const malchusDefinition = createProceduralDefinition(chochmahDefinition);
	const malchusRequest = canonicalRequest(binahRequest);
	const binahSemanticIds = createDefinitionSemanticIdIndex(malchusDefinition);
	const gevurahReasons = [
		...compilerRequirementFailures(tiferesCapability.requires, binahSemanticIds)
	];
	if (!matchesCompilerKind(tiferesCapability.kinds, malchusDefinition.kind)) {
		gevurahReasons.unshift(`kind:${malchusDefinition.kind}`);
	}
	const tiferesChannelSet = new Set(tiferesCapability.channels);
	const yesodDesired = requestedArtifactChannels(malchusRequest);
	const hodCovered = yesodDesired.filter((channel) => tiferesChannelSet.has(channel));
	const netzachRelevant = yesodDesired.length === 0 || hodCovered.length > 0;
	if (!netzachRelevant) gevurahReasons.push('channels:none-requested-covered');
	return Object.freeze({
		compilerId: tiferesCapability.id,
		definitionId: malchusDefinition.id,
		accepted: gevurahReasons.length === 0,
		semanticallyEligible: !gevurahReasons.some(
			(reason) => reason !== 'channels:none-requested-covered'
		),
		relevant: netzachRelevant,
		reasons: Object.freeze(gevurahReasons),
		coveredChannels: Object.freeze(hodCovered),
		coveredRequiredChannels: covered(malchusRequest.required, tiferesChannelSet),
		coveredOptionalChannels: covered(malchusRequest.optional, tiferesChannelSet),
		missingRequiredChannels: missing(malchusRequest.required, tiferesChannelSet),
		adapterPreferenceMatched: adapterPreferenceMatches(
			tiferesCapability.adapters,
			malchusRequest.preferredAdapters
		),
		semanticSupport: createCompilerSemanticMatchEvidence(
			tiferesCapability,
			binahSemanticIds
		),
		cost: tiferesCapability.cost || Object.freeze({}),
		lod: tiferesCapability.lod || null
	});
}

/** @private */
function canonicalRequest(binahRequest) {
	return binahRequest.schema === 'awtsmoos.procedural-artifact-request'
		? binahRequest
		: createArtifactRequest(binahRequest);
}

/** @private */
function covered(chochmahChannels, tiferesChannelSet) {
	return Object.freeze(chochmahChannels.filter((channel) => tiferesChannelSet.has(channel)));
}

/** @private */
function missing(chochmahChannels, tiferesChannelSet) {
	return Object.freeze(chochmahChannels.filter((channel) => !tiferesChannelSet.has(channel)));
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
