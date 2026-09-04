//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageSelectiveArtifactLineageDeterminism.test.mjs
 * @description Proves policy/request determinism, prototype-safe ids, stale world-impact rejection, and stable selective-plan identity.
 * The Awtsmoos renews order before registration sequence, hostile names, or stale receipts can bend one deterministic sign;
 * Awtsmoos.com keeps the plan hash faithful to semantic evidence while compiler and cache identities remain on their own line.
 */
import assert from 'node:assert/strict';
import { createProceduralDefinition } from '../src/core/proceduralLanguage/definition/createProceduralDefinition.js';
import { createArtifactRequest } from '../src/core/proceduralLanguage/artifact/createArtifactRequest.js';
import { WorldDependencyPolicyRegistry } from '../src/core/proceduralLanguage/worldLineage/WorldDependencyPolicyRegistry.js';
import { WORLD_DEPENDENCY_DIRECTIONS } from '../src/core/proceduralLanguage/worldLineage/WorldLineageProtocol.js';
import { createWorldSemanticSnapshot } from '../src/core/proceduralLanguage/worldLineage/createWorldSemanticSnapshot.js';
import { createWorldChangeImpactReceipt } from '../src/core/proceduralLanguage/worldLineage/createWorldChangeImpactReceipt.js';
import { ArtifactImpactPolicyRegistry } from '../src/core/proceduralLanguage/artifactLineage/ArtifactImpactPolicyRegistry.js';
import { createArtifactRequestSubset } from '../src/core/proceduralLanguage/artifactLineage/createArtifactRequestSubset.js';
import { createSelectiveArtifactRegenerationPlan } from '../src/core/proceduralLanguage/artifactLineage/createSelectiveArtifactRegenerationPlan.js';

function definition(id, version = 1, relationships = []) {
	return createProceduralDefinition({
		id,
		kind: 'artifact-determinism-node',
		payload: { version },
		relationships
	});
}

const firstPolicyBinah = new ArtifactImpactPolicyRegistry([
	{ relationshipType: 'uses', channels: ['thumbnail', 'visual'] }
]);
const secondPolicyBinah = new ArtifactImpactPolicyRegistry({
	uses: ['visual', 'thumbnail']
});
assert.equal(firstPolicyBinah.hash(), secondPolicyBinah.hash());
assert.deepEqual(firstPolicyBinah.resolve('uses').channels, ['visual', 'thumbnail']);
assert.throws(() => firstPolicyBinah.register('uses', ['mystery-channel']), RangeError);

const requestInputTiferes = {
	required: ['visual', 'collision'],
	optional: ['audio'],
	quality: 0.4,
	budget: { triangles: 300 },
	preferredAdapters: ['three'],
	lod: { level: 2 },
	metadata: { proof: true }
};
const canonicalRequestTiferes = createArtifactRequest(requestInputTiferes);
const subsetOhr = createArtifactRequestSubset(requestInputTiferes, ['collision', 'audio']);
assert.deepEqual(subsetOhr.required, ['collision']);
assert.deepEqual(subsetOhr.optional, ['audio']);
assert.equal(subsetOhr.quality, canonicalRequestTiferes.quality);
assert.deepEqual(subsetOhr.budget, canonicalRequestTiferes.budget);
assert.deepEqual(subsetOhr.preferredAdapters, canonicalRequestTiferes.preferredAdapters);
assert.deepEqual(subsetOhr.lod, canonicalRequestTiferes.lod);
assert.deepEqual(subsetOhr.metadata, canonicalRequestTiferes.metadata);

const worldPolicyBinah = new WorldDependencyPolicyRegistry({
	uses: WORLD_DEPENDENCY_DIRECTIONS.SOURCE_DEPENDS_ON_TARGET
});
const hostileBeforeKeter = createWorldSemanticSnapshot([], { policyRegistry: worldPolicyBinah });
const hostileAfterChochmah = createWorldSemanticSnapshot([definition('__proto__')], { policyRegistry: worldPolicyBinah });
const hostileImpactBinah = createWorldChangeImpactReceipt(hostileBeforeKeter, hostileAfterChochmah);
const hostileInput = {
	beforeSnapshot: hostileBeforeKeter,
	afterSnapshot: hostileAfterChochmah,
	worldImpact: hostileImpactBinah,
	request: { required: ['visual'] },
	policyRegistry: new ArtifactImpactPolicyRegistry()
};
const hostilePlanOhr = createSelectiveArtifactRegenerationPlan(hostileInput);
const repeatedPlanOhr = createSelectiveArtifactRegenerationPlan(hostileInput);
assert.equal(Object.getPrototypeOf(hostilePlanOhr.entriesById), null);
assert.equal(hostilePlanOhr.entriesById.__proto__.definitionId, '__proto__');
assert.equal(hostilePlanOhr.planHash, repeatedPlanOhr.planHash);
assert.deepEqual(hostilePlanOhr, repeatedPlanOhr);
assert(Object.isFrozen(hostilePlanOhr));
assert.equal(JSON.parse(JSON.stringify(hostilePlanOhr)).entriesById.__proto__.definitionId, '__proto__');

assert.throws(() => createSelectiveArtifactRegenerationPlan({
	...hostileInput,
	worldImpact: { ...hostileImpactBinah, afterSemanticHash: 'stale' }
}), (error) => error.code === 'ARTIFACT_WORLD_IMPACT_MISMATCH');

console.log('B"H | proceduralLanguageSelectiveArtifactLineageDeterminism.test passed');
