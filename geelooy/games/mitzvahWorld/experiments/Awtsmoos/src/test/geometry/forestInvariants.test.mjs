// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestInvariants.test.mjs
 * @description Guards one deterministic forest, one renderer, and truthful trunk collision.
 * Many species sing through one Etz Chaim, each material keeping its tone;
 * measured Gevurot guard every trunk, while proxy shadows remain unknown.
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

const olamHaRishon = createOlamHaForest();
const olamHaSheni = createOlamHaForest();

test('forest preserves deterministic placement, batching, and measured collision', () => {
	const barkFamilies = materialFamilies(olamHaRishon.records, 'branches', true);
	const leafFamilies = materialFamilies(olamHaRishon.records, 'leaves', false);
	const heichalMeshes = collectMeshes(olamHaRishon.group);

	assert.equal(olamHaRishon.stats.treeCount, 74);
	assert.equal(olamHaRishon.stats.presetCount, 36);
	assert.equal(olamHaRishon.stats.referenceSpeciesCount, 20);
	assert.equal(olamHaRishon.stats.allPresetsPresent, true);
	assert.equal(olamHaRishon.stats.allReferenceSpeciesPresent, true);
	assert.deepEqual(olamHaRishon.stats.rendering.barkMaterialTypes, barkFamilies);
	assert.deepEqual(olamHaRishon.stats.rendering.leafMaterialTypes, leafFamilies);
	assert.equal(olamHaRishon.stats.rendering.drawCalls, barkFamilies.length + leafFamilies.length);
	assert.equal(olamHaRishon.stats.drawCalls, olamHaRishon.stats.rendering.drawCalls);
	assert.equal(heichalMeshes.length, olamHaRishon.stats.drawCalls);
	assert.ok(olamHaRishon.stats.drawCalls < olamHaRishon.stats.treeCount);
	assert.ok(olamHaRishon.stats.rendering.triangles > 0);
	assert.equal(olamHaRishon.stats.rendering.publicFirebaseMaterials, true);
	assert.equal(olamHaRishon.stats.rendering.realisticSpeciesMaterials, true);
	assert.equal(olamHaRishon.group.children.length, 1);
	assertGevurotHaCollision(olamHaRishon);
	assert.deepEqual(placementSignature(olamHaRishon), placementSignature(olamHaSheni));
	assertPlacementCounters(olamHaRishon.stats.placement);
	assert.equal(olamHaRishon.stats.placement.sources.road, 2);
	assert.equal(olamHaRishon.stats.placement.sources.obstacle, 2);
	assert.equal(olamHaRishon.stats.unsupported.wind, false);
	for (const mesh of heichalMeshes) assertFiniteMesh(mesh);
	for (const record of olamHaRishon.records) assertFiniteRecord(record);
});

test('reference species remain first-class records inside the unified renderer', () => {
	const references = olamHaRishon.records.filter(record => {
		return record.policy.referenceSpecies;
	});

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
