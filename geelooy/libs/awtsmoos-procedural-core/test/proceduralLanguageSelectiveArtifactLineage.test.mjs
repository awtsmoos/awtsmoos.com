//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageSelectiveArtifactLineage.test.mjs
 * @description Proves end-to-end selective artifact regeneration from world impact, real patch receipts, explicit channel policy, and canonical ArtifactRequest intent.
 * The Awtsmoos renews each changed Definition before one stale channel can summon every artifact anew;
 * Awtsmoos.com proves direct and propagated causes can narrow regeneration while compiler and cache authorities keep the work they already knew.
 */
import assert from 'node:assert/strict';
import { createProceduralDefinition } from '../src/core/proceduralLanguage/definition/createProceduralDefinition.js';
import { createProceduralPatchReceipt } from '../src/core/proceduralLanguage/patch/createProceduralPatchReceipt.js';
import { createArtifactRequest } from '../src/core/proceduralLanguage/artifact/createArtifactRequest.js';
import { WorldDependencyPolicyRegistry } from '../src/core/proceduralLanguage/worldLineage/WorldDependencyPolicyRegistry.js';
import { WORLD_DEPENDENCY_DIRECTIONS } from '../src/core/proceduralLanguage/worldLineage/WorldLineageProtocol.js';
import { createWorldSemanticSnapshot } from '../src/core/proceduralLanguage/worldLineage/createWorldSemanticSnapshot.js';
import { createWorldChangeImpactReceipt } from '../src/core/proceduralLanguage/worldLineage/createWorldChangeImpactReceipt.js';
import { ArtifactImpactPolicyRegistry } from '../src/core/proceduralLanguage/artifactLineage/ArtifactImpactPolicyRegistry.js';
import { createSelectiveArtifactRegenerationPlan } from '../src/core/proceduralLanguage/artifactLineage/createSelectiveArtifactRegenerationPlan.js';

function createDefinition(id, version = 1, relationships = []) {
	return createProceduralDefinition({
		id,
		kind: 'artifact-lineage-node',
		payload: { version },
		relationships
	});
}

function createWorld(rootVersion = 1) {
	return [
		createDefinition('root', rootVersion),
		createDefinition('leaf', 1, [{ id: 'uses-edge', type: 'uses', from: 'leaf', to: 'root' }])
	];
}

const worldPolicyBinah = new WorldDependencyPolicyRegistry({
	uses: WORLD_DEPENDENCY_DIRECTIONS.SOURCE_DEPENDS_ON_TARGET
});
const beforeDefinitions = createWorld(1);
const afterDefinitions = createWorld(2);
const beforeKeter = createWorldSemanticSnapshot(beforeDefinitions, { policyRegistry: worldPolicyBinah });
const afterChochmah = createWorldSemanticSnapshot(afterDefinitions, { policyRegistry: worldPolicyBinah });
const worldImpactBinah = createWorldChangeImpactReceipt(beforeKeter, afterChochmah);
const rootPatchHod = createProceduralPatchReceipt(
	beforeDefinitions[0],
	afterDefinitions[0],
	[{ op: 'set', path: 'payload.version', value: 2 }],
	{ affects: ['collision'], reason: 'root shape changed' }
);
const artifactPolicyBinah = new ArtifactImpactPolicyRegistry({ uses: ['collision'] });
const requestInputTiferes = {
	required: ['visual', 'collision'],
	optional: ['audio'],
	quality: 0.75,
	budget: { triangles: 5000 },
	preferredAdapters: ['three'],
	lod: { level: 1 },
	metadata: { mode: 'selective-test' }
};
const canonicalRequestTiferes = createArtifactRequest(requestInputTiferes);
const planOhr = createSelectiveArtifactRegenerationPlan({
	beforeSnapshot: beforeKeter,
	afterSnapshot: afterChochmah,
	worldImpact: worldImpactBinah,
	request: requestInputTiferes,
	patchReceipts: [rootPatchHod],
	policyRegistry: artifactPolicyBinah
});

assert.equal(planOhr.entries.length, 2);
assert.equal(planOhr.entriesById.root.action, 'regenerate');
assert.deepEqual(planOhr.entriesById.root.regenerate.channels, ['collision']);
assert.deepEqual(planOhr.entriesById.root.request.required, ['collision']);
assert.equal(planOhr.entriesById.root.request.quality, canonicalRequestTiferes.quality);
assert.deepEqual(planOhr.entriesById.root.request.budget, canonicalRequestTiferes.budget);
assert.deepEqual(planOhr.entriesById.root.request.lod, canonicalRequestTiferes.lod);
assert.deepEqual(planOhr.entriesById.leaf.regenerate.channels, ['collision']);
assert.equal(planOhr.entriesById.leaf.dependencyEvidence.knownReasons[0].upstreamId, 'root');
assert(!planOhr.entriesById.root.regenerate.channels.includes('visual'));
assert(!planOhr.entriesById.leaf.regenerate.channels.includes('audio'));
assert.equal(Object.getPrototypeOf(planOhr.entriesById), null);
assert(Object.isFrozen(planOhr));
assert.equal(JSON.parse(JSON.stringify(planOhr)).entriesById.root.definitionId, 'root');

const additionBefore = createWorldSemanticSnapshot([createDefinition('root')], { policyRegistry: worldPolicyBinah });
const additionImpact = createWorldChangeImpactReceipt(additionBefore, beforeKeter);
const additionPlan = createSelectiveArtifactRegenerationPlan({
	beforeSnapshot: additionBefore,
	afterSnapshot: beforeKeter,
	worldImpact: additionImpact,
	request: requestInputTiferes,
	policyRegistry: artifactPolicyBinah
});
assert.equal(additionPlan.entriesById.leaf.action, 'regenerate');
assert.deepEqual(additionPlan.entriesById.leaf.regenerate.channels, ['visual', 'collision', 'audio']);

const removalAfter = createWorldSemanticSnapshot([createDefinition('root')], { policyRegistry: worldPolicyBinah });
const removalImpact = createWorldChangeImpactReceipt(beforeKeter, removalAfter);
const removalPlan = createSelectiveArtifactRegenerationPlan({
	beforeSnapshot: beforeKeter,
	afterSnapshot: removalAfter,
	worldImpact: removalImpact,
	request: requestInputTiferes,
	policyRegistry: artifactPolicyBinah
});
assert.equal(removalPlan.entriesById.leaf.action, 'retire');
assert.deepEqual(removalPlan.entriesById.leaf.retire.channels, ['visual', 'collision', 'audio']);
assert.equal(removalPlan.entriesById.leaf.request, null);

console.log('B"H | proceduralLanguageSelectiveArtifactLineage.test passed');
