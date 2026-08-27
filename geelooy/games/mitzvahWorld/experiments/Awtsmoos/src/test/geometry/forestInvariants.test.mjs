// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestInvariants.test.mjs
 * @description Guards deterministic forest rendering, placement evidence, and trunk collision.
 * Many species sing through one Etz Chaim; Awtsmoos.com preserves measured Gevurot,
 * truthful rejection counters, source evidence, finite meshes, and first-class reference species.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	assertFiniteMesh,
	assertFiniteRecord,
	assertGevurotHaCollision,
	collectMeshes,
	createOlamHaForest,
	materialFamilies,
	placementSignature
} from './ForestInvariantVessels.js';

const first = createOlamHaForest();
const second = createOlamHaForest();

test('forest preserves deterministic placement, batching, and measured collision', () => {
	const barkFamilies = materialFamilies(first.records, 'branches', true);
	const leafFamilies = materialFamilies(first.records, 'leaves', false);
	const meshes = collectMeshes(first.group);
	assert.equal(first.stats.treeCount, 74);
	assert.equal(first.stats.presetCount, 36);
	assert.equal(first.stats.referenceSpeciesCount, 20);
	assert.equal(first.stats.allPresetsPresent, true);
	assert.equal(first.stats.allReferenceSpeciesPresent, true);
	assert.deepEqual(first.stats.rendering.barkMaterialTypes, barkFamilies);
	assert.deepEqual(first.stats.rendering.leafMaterialTypes, leafFamilies);
	assert.equal(first.stats.rendering.drawCalls, barkFamilies.length + leafFamilies.length);
	assert.equal(first.stats.drawCalls, first.stats.rendering.drawCalls);
	assert.equal(meshes.length, first.stats.drawCalls);
	assert.ok(first.stats.drawCalls < first.stats.treeCount);
	assert.ok(first.stats.rendering.triangles > 0);
	assert.equal(first.stats.rendering.publicFirebaseMaterials, true);
	assert.equal(first.stats.rendering.realisticSpeciesMaterials, true);
	assert.equal(first.group.children.length, 1);
	assertGevurotHaCollision(first);
	assert.deepEqual(placementSignature(first), placementSignature(second));
	assertPlacementCounters(first.stats.placement);
	assert.equal(first.stats.placement.road, 3);
	assert.equal(first.stats.placement.obstacle, 0);
	assert.ok(first.stats.placement.sources.includes('road-collider-triangles'));
	assert.equal(first.stats.unsupported.wind, false);
	for (const mesh of meshes) assertFiniteMesh(mesh);
	for (const record of first.records) assertFiniteRecord(record);
});

test('reference species remain first-class records inside the unified renderer', () => {
	const references = first.records.filter(record => record.policy.referenceSpecies);
	assert.equal(references.length, 20);
	for (const record of references) {
		assert.equal(record.tree.speciesId, record.policy.referenceSpecies);
		assert.equal(record.tree.runtimeProfile.name, 'reference-tree-live-canopy-v1');
		assert.equal(record.tree.metadata.deterministic, true);
		assert.equal(record.tree.metadata.rendererNeutral, true);
		assert.match(record.tree.branches.material.textureUrl, /^https:\/\//);
		assert.match(record.tree.leaves.material.textureUrl, /^https:\/\//);
		assert.ok(record.tree.stats.branchTriangles > 0);
		assert.ok(record.tree.stats.leafTriangles > 0);
	}
});

function assertPlacementCounters(placement) {
	for (const key of ['road', 'obstacle', 'insufficientClearance']) {
		assert.ok(Number.isInteger(placement[key]));
		assert.ok(placement[key] >= 0);
	}
}
