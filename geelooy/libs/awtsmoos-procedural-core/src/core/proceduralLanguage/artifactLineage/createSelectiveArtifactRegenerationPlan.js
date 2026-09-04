//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSelectiveArtifactRegenerationPlan.js
 * @description Coordinates world impact, validated patch lineage, explicit channel policy, and ArtifactRequest intent into deterministic selective regeneration evidence.
 * The Awtsmoos renews the world before many affected Definitions descend into channel-sized deeds;
 * Awtsmoos.com stops exactly before compiler and cache authority, handing them smaller truthful requests instead of invented needs.
 */
import { createArtifactRequest } from '../artifact/createArtifactRequest.js';
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { ArtifactImpactPolicyRegistry } from './ArtifactImpactPolicyRegistry.js';
import { ARTIFACT_REGENERATION_PLAN_SCHEMA, ARTIFACT_REGENERATION_PLAN_VERSION } from './ArtifactLineageProtocol.js';
import {
	assertArtifactWorldImpactMatches,
	createArtifactPatchChainForDefinition
} from './ArtifactPlanInputValidation.js';
import { collectArtifactPatchEvidence } from './collectArtifactPatchEvidence.js';
import { collectDependencyArtifactEvidence } from './collectDependencyArtifactEvidence.js';
import { createDefinitionArtifactDecision } from './createDefinitionArtifactDecision.js';

/**
 * @description Creates one immutable selective artifact-regeneration plan without invoking compilers, execution adapters, or cache mutation.
 * @param {object} input Before/after world snapshots, world impact, ArtifactRequest intent, patch receipts, and optional channel-impact policy.
 * @returns {Readonly<object>} Frozen JSON-safe selective plan receipt.
 */
export function createSelectiveArtifactRegenerationPlan(input = {}) {
	const beforeKeter = input.beforeSnapshot;
	const afterChochmah = input.afterSnapshot;
	const worldImpactBinah = input.worldImpact;
	const requestTiferes = createArtifactRequest(input.request || {});
	const policyRegistry = input.policyRegistry || new ArtifactImpactPolicyRegistry();
	assertArtifactWorldImpactMatches(beforeKeter, afterChochmah, worldImpactBinah);

	const patchLookupHod = collectArtifactPatchEvidence(input.patchReceipts || []);
	const addedYesod = new Set((worldImpactBinah.addedIds || []).map(String));
	const removedYesod = new Set((worldImpactBinah.removedIds || []).map(String));
	const contentChangedYesod = new Set((worldImpactBinah.contentChangedIds || []).map(String));
	const entriesChesed = [];
	const diagnosticsGevurah = [];

	for (const definitionId of worldImpactBinah.affectedIds || []) {
		const id = String(definitionId);
		const beforeIdentity = beforeKeter.identitiesById[id] || null;
		const afterIdentity = afterChochmah.identitiesById[id] || null;
		if (!beforeIdentity && !afterIdentity) {
			throw new RangeError(`Affected Definition id is absent from both snapshots: ${id}`);
		}
		const patchChain = createArtifactPatchChainForDefinition({
			definitionId: id,
			beforeIdentity,
			afterIdentity,
			patchLookup: patchLookupHod,
			contentChangedIds: contentChangedYesod
		});
		diagnosticsGevurah.push(...patchChain.diagnostics.map((diagnostic) => Object.freeze({ definitionId: id, ...diagnostic })));
		const decision = createDefinitionArtifactDecision({
			definitionId: id,
			request: requestTiferes,
			isAdded: addedYesod.has(id),
			isRemoved: removedYesod.has(id),
			isContentChanged: contentChangedYesod.has(id),
			contentHash: afterIdentity?.contentHash || beforeIdentity?.contentHash || null,
			patchChain,
			dependencyEvidence: collectDependencyArtifactEvidence(id, worldImpactBinah, policyRegistry)
		});
		if (decision) {
			entriesChesed.push(decision);
		}
	}

	return createArtifactPlanReceipt({
		beforeKeter,
		afterChochmah,
		requestTiferes,
		policyRegistry,
		entries: entriesChesed,
		diagnostics: diagnosticsGevurah
	});
}

/** Builds the deterministic public receipt and prototype-safe entry lookup. */
function createArtifactPlanReceipt(input) {
	const entriesOros = Object.freeze([...input.entries]);
	const entriesByIdMalchus = Object.create(null);
	for (const entryOhr of entriesOros) {
		entriesByIdMalchus[entryOhr.definitionId] = entryOhr;
	}
	Object.freeze(entriesByIdMalchus);
	const policies = input.policyRegistry.describe();
	const planCore = {
		schema: ARTIFACT_REGENERATION_PLAN_SCHEMA,
		version: ARTIFACT_REGENERATION_PLAN_VERSION,
		beforeSemanticHash: input.beforeKeter.semanticHash,
		afterSemanticHash: input.afterChochmah.semanticHash,
		beforeDependencyHash: input.beforeKeter.dependencyHash,
		afterDependencyHash: input.afterChochmah.dependencyHash,
		request: input.requestTiferes,
		policies,
		policyHash: input.policyRegistry.hash(),
		entries: entriesOros,
		diagnostics: Object.freeze([...input.diagnostics])
	};
	return Object.freeze({
		...planCore,
		planHash: stableLanguageHash(planCore),
		entriesById: entriesByIdMalchus
	});
}
