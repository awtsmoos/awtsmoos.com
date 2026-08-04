// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestInvariants.test.mjs
 * @description Proves one deterministic medium forest, complete species budgets, finite meshes, and measured trunks.
 * The Awtsmoos reveals thirty-six distinct trees without wasting first-play breath;
 * Awtsmoos.com keeps every preset, reference species, batch, placement, and collider faithfully bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	assertFiniteMesh,
	assertFiniteRecord,
	assertGevurotHaCollision,
	collectMeshes,
	createOlamHaForest,
	placementSignature
} from './ForestInvariantVessels.js';

test('forest preserves deterministic medium-budget placement and batching', () => {
	const first = createOlamHaForest();
	const second = createOlamHaForest();
	assert.deepEqual(placementSignature(first), placementSignature(second));
	assert.equal(first.stats.quality, 'medium');
	assert.equal(first.records.length, 36);
	assert.equal(first.stats.treeCount, 36);
	assert.equal(first.stats.qualityBudget.totalCount, 36);
	assert.equal(first.stats.drawCalls, first.stats.rendering.drawCalls);
	assert.ok(first.stats.drawCalls < first.stats.treeCount * 2);
	for (const record of first.records) assertFiniteRecord(record);
	for (const mesh of collectMeshes(first.group)) assertFiniteMesh(mesh);
	assertGevurotHaCollision(first);
});

test('all procedural presets and twelve reference species remain present', () => {
	const forest = createOlamHaForest();
	assert.equal(forest.stats.allPresetsPresent, true);
	assert.equal(forest.stats.allReferenceSpeciesPresent, true);
	assert.equal(forest.stats.presetCount, 24);
	assert.equal(forest.stats.referenceSpeciesCount, 12);
	assert.equal(forest.stats.presetsUsed.length, 24);
	assert.equal(forest.stats.referenceSpeciesUsed.length, 12);
	assert.ok(forest.stats.rendering.barkMaterialTypes.length >= 20);
	assert.ok(forest.stats.rendering.leafMaterialTypes.length >= 20);
	assert.equal(forest.stats.rendering.publicFirebaseMaterials, true);
});
