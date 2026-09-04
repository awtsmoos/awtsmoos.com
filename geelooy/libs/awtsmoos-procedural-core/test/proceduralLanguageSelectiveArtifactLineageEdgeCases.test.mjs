//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageSelectiveArtifactLineageEdgeCases.test.mjs
 * @description Attacks uncertainty, latent-only work, explicit no-impact policy, and missing, branching, or cyclic patch-lineage evidence.
 * The Awtsmoos renews every hidden edge before silence can masquerade as certainty or stale history as today's decree;
 * Awtsmoos.com keeps unknown channels named and latent channels visible, so selective rebuilding never guesses what it cannot see.
 */
import assert from 'node:assert/strict';
import { createProceduralDefinition } from '../src/core/proceduralLanguage/definition/createProceduralDefinition.js';
import { createProceduralPatchReceipt } from '../src/core/proceduralLanguage/patch/createProceduralPatchReceipt.js';
import { WorldDependencyPolicyRegistry } from '../src/core/proceduralLanguage/worldLineage/WorldDependencyPolicyRegistry.js';
import { WORLD_DEPENDENCY_DIRECTIONS } from '../src/core/proceduralLanguage/worldLineage/WorldLineageProtocol.js';
import { createWorldSemanticSnapshot } from '../src/core/proceduralLanguage/worldLineage/createWorldSemanticSnapshot.js';
import { createWorldChangeImpactReceipt } from '../src/core/proceduralLanguage/worldLineage/createWorldChangeImpactReceipt.js';
import { ArtifactImpactPolicyRegistry } from '../src/core/proceduralLanguage/artifactLineage/ArtifactImpactPolicyRegistry.js';
import { createSelectiveArtifactRegenerationPlan } from '../src/core/proceduralLanguage/artifactLineage/createSelectiveArtifactRegenerationPlan.js';
import { resolveArtifactPatchChain } from '../src/core/proceduralLanguage/artifactLineage/resolveArtifactPatchChain.js';

function definition(id, version = 1, relationships = []) {
	return createProceduralDefinition({ id, kind: 'artifact-edge-node', payload: { version }, relationships });
}

const worldPolicyBinah = new WorldDependencyPolicyRegistry({
	uses: WORLD_DEPENDENCY_DIRECTIONS.SOURCE_DEPENDS_ON_TARGET
});
const beforeDefinitions = [
	definition('root', 1),
	definition('leaf', 1, [{ id: 'uses-edge', type: 'uses', from: 'leaf', to: 'root' }])
];
const afterDefinitions = [
	definition('root', 2),
	beforeDefinitions[1]
];
const beforeKeter = createWorldSemanticSnapshot(beforeDefinitions, { policyRegistry: worldPolicyBinah });
const afterChochmah = createWorldSemanticSnapshot(afterDefinitions, { policyRegistry: worldPolicyBinah });
const impactBinah = createWorldChangeImpactReceipt(beforeKeter, afterChochmah);

const uncertainPlan = createSelectiveArtifactRegenerationPlan({
	beforeSnapshot: beforeKeter,
	afterSnapshot: afterChochmah,
	worldImpact: impactBinah,
	request: { required: ['visual'], optional: ['collision', 'thumbnail'] },
	policyRegistry: new ArtifactImpactPolicyRegistry()
});
assert.equal(uncertainPlan.entriesById.root.action, 'reconsider');
assert.deepEqual(uncertainPlan.entriesById.root.reconsider.channels, ['visual', 'collision', 'thumbnail']);
assert.equal(uncertainPlan.entriesById.leaf.action, 'reconsider');

const latentPatchHod = createProceduralPatchReceipt(
	beforeDefinitions[0],
	afterDefinitions[0],
	[{ op: 'set', path: 'payload.version', value: 2 }],
	{ affects: ['thumbnail'] }
);
const latentPlan = createSelectiveArtifactRegenerationPlan({
	beforeSnapshot: beforeKeter,
	afterSnapshot: afterChochmah,
	worldImpact: impactBinah,
	request: { required: ['visual'] },
	patchReceipts: [latentPatchHod],
	policyRegistry: new ArtifactImpactPolicyRegistry({ uses: [] })
});
assert.equal(latentPlan.entriesById.root.action, 'latent-stale');
assert.deepEqual(latentPlan.entriesById.root.latentStaleChannels, ['thumbnail']);
assert.equal(latentPlan.entriesById.root.request, null);
assert.equal(latentPlan.entriesById.leaf, undefined);

const missingChain = resolveArtifactPatchChain([], 'before', 'after');
assert.equal(missingChain.complete, false);
assert.equal(missingChain.diagnostics[0].code, 'ARTIFACT_PATCH_CHAIN_MISSING');

const ambiguousChain = resolveArtifactPatchChain([
	{ beforeHash: 'a', afterHash: 'b', affectedChannels: ['visual'] },
	{ beforeHash: 'a', afterHash: 'c', affectedChannels: ['collision'] }
], 'a', 'z');
assert.equal(ambiguousChain.complete, false);
assert.equal(ambiguousChain.diagnostics[0].code, 'ARTIFACT_PATCH_CHAIN_AMBIGUOUS');

const cycleChain = resolveArtifactPatchChain([
	{ beforeHash: 'a', afterHash: 'b', affectedChannels: [] },
	{ beforeHash: 'b', afterHash: 'a', affectedChannels: [] }
], 'a', 'z');
assert.equal(cycleChain.complete, false);
assert.equal(cycleChain.diagnostics[0].code, 'ARTIFACT_PATCH_CHAIN_CYCLE');

console.log('B"H | proceduralLanguageSelectiveArtifactLineageEdgeCases.test passed');
